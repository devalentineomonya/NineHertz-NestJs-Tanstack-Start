import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';

import { Patient } from '../patient/entities/patient.entity';

import { OrderItem } from './entities/order-item.entity';
import { Medicine } from '../medicine/entities/medicine.entity';

import { OrderStatus } from 'src/enums/order.enum';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { StripeService } from 'src/payment/stripe.service';
import { PaystackService } from 'src/payment/paystack.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Pharmacy } from 'src/pharmacy/entity/pharmacy.entity';
import { OrderFilterDto } from './dto/order-filter.dto';
import { OrderPaginatedDto } from './dto/order-paginated.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderItem)
    private pharmacyRepository: Repository<Pharmacy>,
    @InjectRepository(Medicine)
    private medicineRepository: Repository<Medicine>,
    private stripeService: StripeService,
    private paystackService: PaystackService,
  ) {}

  async create(createDto: CreateOrderDto): Promise<OrderResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id: createDto.patientId },
      relations: ['user'],
    });
    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${createDto.patientId} not found`,
      );
    }

    const pharmacy = await this.pharmacyRepository.findOne({
      where: { id: createDto.pharmacyId },
      relations: ['institution'],
    });
    if (!pharmacy) {
      throw new NotFoundException(
        `Pharmacy with ID ${createDto.pharmacyId} not found`,
      );
    }

    // Verify all medicines exist
    const medicineIds = createDto.items.map((item) => item.medicineId);
    const medicines = await this.medicineRepository.findByIds(medicineIds);
    if (medicines.length !== medicineIds.length) {
      const foundIds = medicines.map((m) => m.id);
      const missingIds = medicineIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Medicines not found: ${missingIds.join(', ')}`,
      );
    }

    // Create order
    const order = this.orderRepository.create({
      status: createDto.status || OrderStatus.PENDING,
      totalAmount: createDto.totalAmount,
      patient,
      pharmacy,
    });

    // Create order items
    const orderItems = createDto.items.map((itemDto) => {
      const medicine = medicines.find((m) => m.id === itemDto.medicineId);
      return this.orderItemRepository.create({
        quantity: itemDto.quantity,
        pricePerUnit: itemDto.pricePerUnit,
        medicine,
      });
    });

    order.items = orderItems;
    const savedOrder = await this.orderRepository.save(order);
    return this.mapToResponseDto(savedOrder);
  }

  async findAll(
    pagination: PaginationDto,
    filters: OrderFilterDto,
  ): Promise<OrderPaginatedDto> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: {
      status?: OrderStatus;
      patient?: { id: string };
      pharmacy?: { id: string };
      orderDate?: any;
    } = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.patientId) {
      where.patient = { id: filters.patientId };
    }

    if (filters.pharmacyId) {
      where.pharmacy = { id: filters.pharmacyId };
    }

    if (filters.fromDate && filters.toDate) {
      where.orderDate = Between(
        new Date(filters.fromDate),
        new Date(filters.toDate),
      );
    } else if (filters.fromDate) {
      where.orderDate = MoreThanOrEqual(new Date(filters.fromDate));
    } else if (filters.toDate) {
      where.orderDate = LessThanOrEqual(new Date(filters.toDate));
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      relations: [
        'patient',
        'patient.user',
        'pharmacy',
        'pharmacy.institution',
        'items',
        'items.medicine',
      ],
      take: limit,
      skip,
      order: { orderDate: 'DESC' },
    });

    return {
      data: orders.map((order) => this.mapToResponseDto(order)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'patient.user',
        'pharmacy',
        'pharmacy.institution',
        'items',
        'items.medicine',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapToResponseDto(order);
  }

  async update(
    id: string,
    updateDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'patient.user',
        'pharmacy',
        'pharmacy.institution',
        'items',
        'items.medicine',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Update status
    if (updateDto.status) {
      order.status = updateDto.status;
    }

    // Update total amount
    if (updateDto.totalAmount) {
      order.totalAmount = updateDto.totalAmount;
    }

    // Update payment information
    if (updateDto.stripePaymentId) {
      order.stripePaymentId = updateDto.stripePaymentId;
    }

    if (updateDto.paystackReference) {
      order.paystackReference = updateDto.paystackReference;
    }

    if (updateDto.paymentStatus) {
      order.paymentStatus = updateDto.paymentStatus;
    }

    // Update items if provided
    if (updateDto.items) {
      // Remove existing items
      await this.orderItemRepository.delete({ order: { id } });

      // Create new items
      const medicineIds = updateDto.items
        .filter((item) => item.medicineId)
        .map((item) => item.medicineId);

      const medicines = await this.medicineRepository.findByIds(medicineIds);

      const orderItems = updateDto.items.map((itemDto) => {
        const medicine = medicines.find((m) => m.id === itemDto.medicineId);
        return this.orderItemRepository.create({
          quantity: itemDto.quantity,
          pricePerUnit: itemDto.pricePerUnit,
          medicine,
          order,
        });
      });

      order.items = await this.orderItemRepository.save(orderItems);
    }

    const updatedOrder = await this.orderRepository.save(order);
    return this.mapToResponseDto(updatedOrder);
  }

  async processPayment(
    id: string,
    paymentMethod: 'stripe' | 'paystack',
    paymentToken: string,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Payment already processed for this order');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be paid');
    }

    // let paymentResult;

    // if (paymentMethod === 'stripe') {
    //   paymentResult = await this.stripeService.charge({
    //     amount: order.totalAmount * 100,
    //     currency: 'usd',
    //     source: paymentToken,
    //     description: `Order #${order.id}`,
    //   });
    //   order.stripePaymentId = paymentResult.id;
    // } else {
    //   paymentResult = await this.paystackService.initializeTransaction({
    //     email: order.patient.user.email,
    //     amount: order.totalAmount * 100,
    //     reference: `order_${order.id}`,
    //   });
    //   order.paystackReference = paymentResult.reference;
    // }
    console.log(paymentMethod);
    console.log(paymentToken);

    order.paymentStatus = 'paid';
    order.status = OrderStatus.PROCESSING;
    const updatedOrder = await this.orderRepository.save(order);

    // Update inventory
    await this.updateInventory(order.id);

    return this.mapToResponseDto(updatedOrder);
  }

  async cancelOrder(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    order.status = OrderStatus.CANCELLED;
    const updatedOrder = await this.orderRepository.save(order);
    return this.mapToResponseDto(updatedOrder);
  }

  async remove(id: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Delete order items first
    if (order.items && order.items.length > 0) {
      await this.orderItemRepository.remove(order.items);
    }

    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  private async updateInventory(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.medicine', 'pharmacy'],
    });

    if (!order) return;

    for (const item of order.items) {
      // await this.inventoryService.deductStock(
      //   item.medicine.id,
      //   order.pharmacy.id,
      //   item.quantity,
      // );
      console.log(item);
    }
  }

  private mapToResponseDto = (order: Order): OrderResponseDto => {
    return {
      id: order.id,
      orderDate: order.orderDate,
      status: order.status,
      totalAmount: order.totalAmount,
      stripePaymentId: order.stripePaymentId,
      paystackReference: order.paystackReference,
      paymentStatus: order.paymentStatus,
      patient: {
        id: order.patient.id,
        fullName: order.patient.fullName,
        phone: order.patient.phone,
        dateOfBirth: order.patient.dateOfBirth,
        medicalHistory: order.patient.medicalHistory,
        user: {
          id: order.patient.user.id,
          email: order.patient.user.email,
          role: order.patient.user.role,
          isEmailVerified: order.patient.user.isEmailVerified,
          createdAt: order.patient.user.createdAt,
        },
      },
      pharmacy: {
        id: order.pharmacy.id,
        name: order.pharmacy.name,
        address: order.pharmacy.address,
        contactPhone: order.pharmacy.contactPhone,
        licenseNumber: order.pharmacy.licenseNumber,
        inventoryIds:
          order.pharmacy.inventory?.map((inventory) => inventory.id) || [],
        orderIds: order.pharmacy.orders?.map((order) => order.id) || [],
        pharmacistIds:
          order.pharmacy.pharmacists?.map((pharmacist) => pharmacist.id) || [],
      },

      items: order.items.map((item) => this.mapItemToResponseDto(item)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  };

  private mapItemToResponseDto(item: OrderItem): OrderItemResponseDto {
    return {
      id: item.id,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      medicine: {
        id: item.medicine.id,
        name: item.medicine.name,
        genericName: item.medicine.genericName,
        description: item.medicine.description,
        price: item.medicine.price,
        manufacturer: item.medicine.manufacturer,
        barcode: item.medicine.barcode,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  }
}
