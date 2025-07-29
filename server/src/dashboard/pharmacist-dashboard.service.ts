import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacist } from 'src/pharmacist/entities/pharmacist.entity';
import { Prescription } from 'src/prescription/entities/prescription.entity';
import { Order } from 'src/order/entities/order.entity';
import { InventoryItem } from 'src/inventory-item/entities/inventory-item.entity';
import { Medicine } from 'src/medicine/entities/medicine.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { OrderStatus } from 'src/enums/order.enum';

@Injectable()
export class PharmacistDashboardService {
  constructor(
    @InjectRepository(Pharmacist)
    private readonly pharmacistRepo: Repository<Pharmacist>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(Medicine)
    private readonly medicineRepo: Repository<Medicine>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async getDashboardData(userId: string) {
    const pharmacist = await this.pharmacistRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!pharmacist) {
      throw new NotFoundException(
        `Pharmacist with user id ${userId} was not found`,
      );
    }

    const [stats, prescriptions, inventory, orders, notifications] =
      await Promise.all([
        this.getPharmacistStats(),
        this.getPrescriptionsToProcess(),
        this.getInventoryAlerts(),
        this.getRecentOrders(),
        this.getNotifications(userId),
      ]);

    return {
      pharmacist: {
        id: pharmacist.id,
        name: pharmacist.fullName,
        licenseNumber: pharmacist.licenseNumber,
      },
      stats,
      prescriptions,
      inventory,
      orders,
      notifications,
    };
  }

  private async getPharmacistStats() {
    const [
      prescriptionsToFill,
      pendingOrders,
      inventoryAlerts,
      readyForPickup,
    ] = await Promise.all([
      // Prescriptions pending processing
      this.prescriptionRepo.count({
        where: [{ isFulfilled: false }],
      }),
      // Orders that are pending or processing
      this.orderRepo.count({
        where: [
          { status: OrderStatus.PENDING },
          { status: OrderStatus.PROCESSING },
        ],
      }),
      // Inventory items below reorder threshold
      this.inventoryRepo
        .createQueryBuilder('inventory')
        .where('inventory.quantity <= inventory.reorderThreshold')
        .getCount(),
      // Orders ready for pickup
      this.orderRepo.count({
        where: { status: OrderStatus.SHIPPED },
      }),
    ]);

    return {
      prescriptionsToFill,
      pendingOrders,
      inventoryAlerts,
      readyForPickup,
    };
  }

  private async getPrescriptionsToProcess() {
    const prescriptions = await this.prescriptionRepo.find({
      where: [{ isFulfilled: false }],
      relations: ['patient', 'patient.user', 'prescribedBy'],
      order: { createdAt: 'ASC' },
      take: 10,
    });

    const medicineIds = new Set<string>();
    prescriptions.forEach((prescription) => {
      prescription.items.forEach((item) => {
        medicineIds.add(item.medicineId);
      });
    });
    const medicines = await this.medicineRepo.findByIds(
      Array.from(medicineIds),
    );
    const medicineMap = new Map(medicines.map((med) => [med.id, med]));

    return prescriptions.map((prescription) => {
      const medicationList = prescription.items
        .map((item) => {
          const medicine = medicineMap.get(item.medicineId);
          return medicine
            ? `${medicine.name} ${item.dosage}`
            : 'Unknown Medicine';
        })
        .join(', ');

      return {
        id: prescription.id,
        patient: prescription.patient.fullName,
        medication: medicationList,
        isFulFilled: prescription.isFulfilled,
        date: prescription.createdAt.toISOString().split('T')[0],
        avatar: this.generateAvatar(prescription.patient.fullName),
        prescribedBy: prescription.prescribedBy.fullName,
        itemCount: prescription.items.length,
      };
    });
  }

  private async getInventoryAlerts() {
    const inventoryItems = await this.inventoryRepo.find({
      relations: ['medicine'],
      order: { quantity: 'ASC' },
    });

    return inventoryItems
      .map((item) => ({
        id: item.id,
        name: `${item.medicine.name} ${item.medicine.type}`,
        stock: item.quantity,
        threshold: item.reorderThreshold,
        status: this.getStockStatus(item.quantity, item.reorderThreshold),
        lastRestocked: item.lastRestocked.toISOString().split('T')[0],
        medicineId: item.medicine.id,
      }))
      .sort((a, b) => {
        // Sort by status priority: Critical -> Low Stock -> In Stock
        const statusPriority = { Critical: 0, 'Low Stock': 1, 'In Stock': 2 };
        return statusPriority[a.status] - statusPriority[b.status];
      })
      .slice(0, 10);
  }

  private async getRecentOrders() {
    const orders = await this.orderRepo.find({
      relations: ['patient', 'patient.user', 'items', 'items.medicine'],
      order: { orderDate: 'DESC' },
      take: 10,
    });

    return orders.map((order) => ({
      id: order.id,
      patient: order.patient.fullName,
      items: order.items.length,
      total: parseFloat(order.totalAmount.toString()),
      status: this.mapOrderStatus(order.status),
      orderDate: order.orderDate.toISOString().split('T')[0],
      patientId: order.patient.id,
    }));
  }

  private async getNotifications(userId: string) {
    const notifications = await this.notificationRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      title: this.formatNotificationTitle(notification.eventType),
      description: notification.message,
      time: this.getTimeAgo(notification.createdAt),
      read: notification.read,
      type: notification.eventType,
    }));
  }

  async markAllNotificationsAsRead(userId: string) {
    await this.notificationRepo.update(
      { user: { id: userId }, read: false },
      { read: true },
    );
    return this.getNotifications(userId);
  }

  private mapOrderStatus(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pending',
      [OrderStatus.PROCESSING]: 'Processing',
      [OrderStatus.SHIPPED]: 'Shipped',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]: 'Cancelled',
      [OrderStatus.FAILED]: 'Failed',
    };
    return statusMap[status] ?? 'Unknown';
  }

  private getStockStatus(quantity: number, threshold: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= threshold * 0.5) return 'Critical';
    if (quantity <= threshold) return 'Low Stock';
    return 'In Stock';
  }

  private generateAvatar(fullName: string): string {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  }

  private formatNotificationTitle(eventType: string): string {
    const titleMap: Record<string, string> = {
      prescription_created: 'New Prescription',
      order_placed: 'New Order',
      inventory_low: 'Low Stock Alert',
      prescription_ready: 'Prescription Ready',
      order_completed: 'Order Completed',
    };
    return titleMap[eventType] || 'Notification';
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  }
}
