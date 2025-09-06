import { useUserSessionStore } from "@/stores/user-session-store";
import { redirect } from "@tanstack/react-router";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

type ApiMethod = "get" | "post" | "put" | "patch" | "delete";

interface ApiRequestConfig<D = any> {
  params?: Record<string, any>;
  json?: D;
  pathParams?: Record<string, any>;
}

interface ApiEndpoint<Request = any, Response = any> {
  call: (
    config?: ApiRequestConfig<Request>
  ) => Promise<AxiosResponse<Response>>;
}

export class DataServices {
  private axiosInstance: AxiosInstance;
  private refreshQueue: Array<{
    resolve: () => void;
    reject: (error: any) => void;
  }> = [];
  private isRefreshing = false;

  private getAccessToken(): string | null {
    return useUserSessionStore.getState().session?.accessToken || null;
  }

  private getRefreshToken(): string | null {
    return useUserSessionStore.getState().session?.refreshToken || null;
  }

  public setSession(sessionData: {
    accessToken: string;
    refreshToken: string;
  }): void {
    useUserSessionStore.getState().setSession(sessionData);
  }

  public clearSession(): void {
    useUserSessionStore.getState().clearSession();
  }

  public readonly api = {
    user: {
      post: this.createEndpoint<CreateUserDto, UserResponseDto>(
        "post",
        "/user"
      ),
      get: this.createEndpoint<void, UserResponseDto[]>("get", "/user"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, UserResponseDto>("get", "/user/{id}", {
          id,
        }),
        patch: this.createEndpoint<UpdateUserDto, UserResponseDto>(
          "patch",
          "/user/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/user/{id}", { id }),
      }),
    },
    patients: {
      _userId: (userId: string) => ({
        post: this.createEndpoint<CreatePatientDto, PatientResponseDto>(
          "post",
          "/patients/{userId}",
          { userId }
        ),
        get: this.createEndpoint<void, void>("get", "/patients/{userId}", {
          userId,
        }),
      }),
      get: this.createEndpoint<void, PatientResponseDto[]>("get", "/patients"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, PatientResponseDto>(
          "get",
          "/patients/{id}",
          { id }
        ),
        put: this.createEndpoint<UpdatePatientDto, PatientResponseDto>(
          "put",
          "/patients/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/patients/{id}", {
          id,
        }),
      }),
    },
    doctors: {
      post: this.createEndpoint<CreateDoctorDto, DoctorResponseDto>(
        "post",
        "/doctors"
      ),
      get: this.createEndpoint<
        void,
        { total: number; data: DoctorResponseDto[] }
      >("get", "/doctors"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, DoctorResponseDto>(
          "get",
          "/doctors/{id}",
          { id }
        ),
        patch: this.createEndpoint<UpdateDoctorDto, DoctorResponseDto>(
          "patch",
          "/doctors/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/doctors/{id}", {
          id,
        }),
      }),
      _id_availability: (id: string) => ({
        get: this.createEndpoint<{ dayOfWeek?: string }, any>(
          "get",
          "/doctors/{id}/availability",
          { id }
        ),
      }),
      user: {
        _userId: (userId: string) => ({
          get: this.createEndpoint<void, PatientResponseDto>(
            "get",
            "/doctors/user/{userId}",
            { userId }
          ),
        }),
      },
    },
    admin: {
      post: this.createEndpoint<CreateAdminDto, AdminResponseDto>(
        "post",
        "/admin"
      ),
      get: this.createEndpoint<void, AdminPaginatedDto>("get", "/admin"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, AdminResponseDto>("get", "/admin/{id}", {
          id,
        }),
        patch: this.createEndpoint<UpdateAdminDto, AdminResponseDto>(
          "patch",
          "/admin/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/admin/{id}", {
          id,
        }),
      }),
      user: {
        _userId: (userId: string) => ({
          get: this.createEndpoint<void, PatientResponseDto>(
            "get",
            "/admin/user/{userId}",
            { userId }
          ),
        }),
      },
    },
    pharmacists: {
      post: this.createEndpoint<CreatePharmacistDto, PharmacistResponseDto>(
        "post",
        "/pharmacists"
      ),
      get: this.createEndpoint<void, PharmacistResponseDto[]>(
        "get",
        "/pharmacists"
      ),
      _id: (id: string) => ({
        get: this.createEndpoint<void, PharmacistResponseDto>(
          "get",
          "/pharmacists/{id}",
          { id }
        ),
        put: this.createEndpoint<UpdatePharmacistDto, PharmacistResponseDto>(
          "put",
          "/pharmacists/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/pharmacists/{id}", {
          id,
        }),
      }),
      user: {
        _userId: (userId: string) => ({
          get: this.createEndpoint<void, PatientResponseDto>(
            "get",
            "/pharmacists/user/{userId}",
            { userId }
          ),
        }),
      },
    },
    appointments: {
      post: this.createEndpoint<CreateAppointmentDto, AppointmentResponseDto>(
        "post",
        "/appointments"
      ),
      get: this.createEndpoint<void, AppointmentPaginatedDto>(
        "get",
        "/appointments"
      ),
      _id: (id: string) => ({
        get: this.createEndpoint<void, AppointmentResponseDto>(
          "get",
          `/appointments/${id}`
        ),
        patch: this.createEndpoint<
          UpdateAppointmentDto,
          AppointmentResponseDto
        >("patch", `/appointments/${id}`),
        delete: this.createEndpoint<void, void>(
          "delete",
          `/appointments/${id}`
        ),
        reviews: this.createEndpoint<CreateReviewDto, ReviewResponseDto>(
          "post",
          `/appointments/${id}/reviews`
        ),
        "mark-as-complete": () => ({
          patch: this.createEndpoint<void, AppointmentResponseDto>(
            "patch",
            `appointments/${id}/complete`
          ),
        }),
        "send-reminder": () => ({
          post: this.createEndpoint<void, AppointmentResponseDto>(
            "post",
            `appointments/${id}/reminder`
          ),
        }),
      }),
      cancel: (id: string) => ({
        patch: this.createEndpoint<{ reason: string }, AppointmentResponseDto>(
          "patch",
          `appointments/${id}/cancel`
        ),
      }),
      videoToken: (callId: string) => ({
        get: this.createEndpoint<void, { token: string }>(
          "get",
          `/appointments/video-token/${callId}`
        ),
      }),
    },
    prescriptions: {
      post: this.createEndpoint<CreatePrescriptionDto, PrescriptionResponseDto>(
        "post",
        "/prescriptions"
      ),
      get: this.createEndpoint<void, PrescriptionResponseDto[]>(
        "get",
        "/prescriptions"
      ),
      _id: (id: string) => ({
        get: this.createEndpoint<void, PrescriptionResponseDto>(
          "get",
          "/prescriptions/{id}",
          { id }
        ),
        patch: this.createEndpoint<
          UpdatePrescriptionDto,
          PrescriptionResponseDto
        >("patch", "/prescriptions/{id}", { id }),
        delete: this.createEndpoint<void, void>(
          "delete",
          "/prescriptions/{id}",
          {
            id,
          }
        ),
      }),
      _patientId: (patientId: string) => ({
        get: this.createEndpoint<void, PrescriptionResponseDto[]>(
          "get",
          "/prescriptions/patient/{patientId}",
          { patientId }
        ),
      }),
    },

    medicines: {
      post: this.createEndpoint<CreateMedicineDto, MedicineResponseDto>(
        "post",
        "/medicines"
      ),
      get: this.createEndpoint<void, MedicinePaginatedDto>("get", "/medicines"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, MedicineResponseDto>(
          "get",
          "/medicines/{id}",
          { id }
        ),
        patch: this.createEndpoint<UpdateMedicineDto, MedicineResponseDto>(
          "patch",
          "/medicines/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/medicines/{id}", {
          id,
        }),
      }),
      barcode: {
        _barcode: (barcode: string) => ({
          get: this.createEndpoint<void, MedicineResponseDto>(
            "get",
            "/medicines/barcode/{barcode}",
            { barcode }
          ),
        }),
      },
    },
    "inventory-items": {
      post: this.createEndpoint<
        CreateInventoryItemDto,
        InventoryItemResponseDto
      >("post", "/inventory-items"),
      get: this.createEndpoint<void, InventoryItemPaginatedDto>(
        "get",
        "/inventory-items"
      ),
      _id: (id: string) => ({
        get: this.createEndpoint<void, InventoryItemResponseDto>(
          "get",
          "/inventory-items/{id}",
          { id }
        ),
        patch: this.createEndpoint<
          UpdateInventoryItemDto,
          InventoryItemResponseDto
        >("patch", "/inventory-items/{id}", { id }),
        delete: this.createEndpoint<void, void>(
          "delete",
          "/inventory-items/{id}",
          { id }
        ),
      }),
      _id_restock: (id: string) => ({
        patch: this.createEndpoint<void, InventoryItemResponseDto>(
          "patch",
          "/inventory-items/{id}/restock",
          { id }
        ),
      }),
    },

    orders: {
      post: this.createEndpoint<CreateOrderDto, OrderResponseDto>(
        "post",
        "/orders"
      ),
      get: this.createEndpoint<void, OrderPaginatedDto>("get", "/orders"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, OrderResponseDto>(
          "get",
          "/orders/{id}",
          { id }
        ),
        patch: this.createEndpoint<UpdateOrderDto, OrderResponseDto>(
          "patch",
          "/orders/{id}",
          { id }
        ),
        delete: this.createEndpoint<void, void>("delete", "/orders/{id}", {
          id,
        }),
      }),
      _id_process_payment: (id: string) => ({
        patch: this.createEndpoint<void, OrderResponseDto>(
          "patch",
          "/orders/{id}/process-payment",
          { id }
        ),
      }),
      _id_cancel: (id: string) => ({
        patch: this.createEndpoint<void, OrderResponseDto>(
          "patch",
          "/orders/{id}/cancel",
          { id }
        ),
      }),
    },
    auth: {
      signup: {
        post: this.createEndpoint<SignUpDto, UserResponseDto>(
          "post",
          "/auth/signup"
        ),
      },
      login: {
        post: this.createEndpoint<
          LoginDto,
          { accessToken: string; refreshToken: string }
        >("post", "/auth/login"),
      },
      refresh: {
        post: this.createEndpoint<
          RefreshTokenDto,
          { accessToken: string; refreshToken: string }
        >("post", "/auth/refresh"),
      },
      verifyTokens: {
        post: this.createEndpoint<
          { accessToken: string; refreshToken: string },
          { success: boolean; message: string; userId: string }
        >("post", "/auth/verify-tokens"),
      },
      password: {
        forgot: {
          post: this.createEndpoint<ResetPasswordInitiateDto, void>(
            "post",
            "/auth/password/forgot"
          ),
        },
        reset: {
          post: this.createEndpoint<ResetPasswordConfirmDto, void>(
            "post",
            "/auth/password/reset"
          ),
        },
      },
      email: {
        update: {
          post: this.createEndpoint<UpdateEmailDto, void>(
            "post",
            "/auth/email/update"
          ),
        },
        verify: {
          post: this.createEndpoint<
            VerifyEmailDto,
            { accessToken: string; refreshToken: string }
          >("post", "/auth/email/verify"),
        },
      },
    },
    dashboard: {
      admin: {
        get: this.createEndpoint<void, AdminDashboardResponse>(
          "get",
          "/dashboard/admin"
        ),
      },
      patient: {
        get: this.createEndpoint<void, PatientDashboardResponse>(
          "get",
          "/dashboard/patient"
        ),
      },
      doctor: {
        get: this.createEndpoint<void, DoctorDashboardResponse>(
          "get",
          "/dashboard/doctor"
        ),
      },
      pharmacist: {
        get: this.createEndpoint<void, PharmacistDashboardResponse>(
          "get",
          "/dashboard/pharmacist"
        ),
      },
    },
    messaging: {
      appointment: {
        post: this.createEndpoint<{ appointmentId: string }, any>(
          "post",
          "messaging/appointment"
        ),
      },

      _user_profile: (userId: string) => ({
        get: this.createEndpoint<void, any>(
          "get",
          "messaging/user/{userId}/profile",
          { userId }
        ),
      }),

      _chatId_mark_read: (chatId: string) => ({
        post: this.createEndpoint<void, { success: boolean }>(
          "post",
          "messaging/{chatId}/mark-read",
          { chatId }
        ),
      }),

      user_my_chats: {
        get: this.createEndpoint<void, any[]>(
          "get",
          "messaging/user/my-chats"
        ),
      },
    },

    notifications: {
      get: this.createEndpoint<void, NotificationResponse>(
        "get",
        "notifications"
      ),
      _id_read: (id: string) => ({
        patch: this.createEndpoint<void, NotificationResponse>(
          "patch",
          "/notifications/{id}/read",
          { id }
        ),
      }),
      test: () => ({
        post: this.createEndpoint<TestNotification, void>(
          "post",
          "notifications/push/test"
        ),
      }),
      subscribe: () => ({
        post: this.createEndpoint<PushSubscriptionDto, void>(
          "post",
          "notifications/push/subscribe"
        ),
      }),
      unsubscribe: () => ({
        post: this.createEndpoint<{ endpoint: string; userId: string }, void>(
          "post",
          "notifications/push/unsubscribe"
        ),
      }),
      _all_read: () => ({
        patch: this.createEndpoint<void, { success: boolean }>(
          "patch",
          "notifications/mark-all-read"
        ),
      }),
    },
    transactions: {
      initiate: this.createEndpoint<
        InitiatePaymentDto,
        {
          transaction: TransactionResponseDto;
          checkoutUrl?: string;
          gatewayReference?: string;
        }
      >("post", "/transactions/initiate"),

      verify: this.createEndpoint<
        { reference: string; gateway: Gateway },
        TransactionResponseDto
      >("post", "/transactions/verify"),

      get: this.createEndpoint<void, TransactionPaginatedDto>(
        "get",
        "/transactions"
      ),

      refund: this.createEndpoint<RefundTransactionDto, TransactionResponseDto>(
        "post",
        "/transactions/refund"
      ),

      _id: (id: string) => ({
        get: this.createEndpoint<void, TransactionResponseDto>(
          "get",
          `/transactions/${id}`
        ),
      }),
    },
  };
  private createEndpoint<Request, Response>(
    method: ApiMethod,
    path: string,
    fixedPathParams: Record<string, string> = {}
  ): ApiEndpoint<Request, Response> {
    return {
      call: (config: ApiRequestConfig<Request> = {}) => {
        let url = path;
        const allPathParams = {
          ...fixedPathParams,
          ...(config.pathParams || {}),
        };

        for (const [param, value] of Object.entries(allPathParams)) {
          url = url.replace(`{${param}}`, encodeURIComponent(value));
        }

        return this.axiosInstance.request<Response>({
          method,
          url,
          params: config?.params,
          data: config?.json,
        });
      },
    };
  }

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "",
      timeout: 300_000,
      headers: { "Content-Type": "application/json" },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const accessToken = this.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };
        const isAuthRoute = originalRequest?.url?.includes("/auth/");

        if (error.response?.status === 401) {
          console.log("Detected 401. Attempting refresh...");
        }

        if (
          !originalRequest ||
          error.response?.status !== 401 ||
          isAuthRoute ||
          originalRequest._retry
        ) {
          return Promise.reject(error);
        }

        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.refreshQueue.push({
              resolve: () => {
                originalRequest.headers.Authorization = `Bearer ${this.getAccessToken()}`;
                resolve(this.axiosInstance(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const refreshToken = this.getRefreshToken();
          if (!refreshToken) throw new Error("No refresh token available");

          const refreshClient = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const response = await refreshClient.post<{
            accessToken: string;
            refreshToken: string;
          }>("/auth/refresh", { refreshToken });

          this.setSession({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          });

          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          this.refreshQueue.forEach((cb) => cb.resolve());

          return this.axiosInstance(originalRequest);
        } catch (refreshError) {
          this.clearSession();
          this.refreshQueue.forEach((cb) => cb.reject(refreshError));
          this.refreshQueue = [];

          if (
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/auth")
          ) {
            redirect({ to: "/auth/signin" });
          }

          return Promise.reject(
            new Error("Session expired. Please log in again.")
          );
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }
}

export const dataServices = new DataServices();
