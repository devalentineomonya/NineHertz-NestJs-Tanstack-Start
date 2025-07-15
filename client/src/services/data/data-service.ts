import { redirect } from "@tanstack/react-router";
import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";

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
  private session: { accessToken?: string; refreshToken?: string } | null = null;
  private getUserSession() {
    const session = localStorage.getItem("user-session");
    const parsedSession = session ? JSON.parse(session) : null;
    return parsedSession?.state?.session
  }

  private getAccessToken(): string | null {
    const session = this.getUserSession();
    console.log("Session",session?.session)
    return session?.accessToken || null;
  }
  private refreshQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];
  private isRefreshing = false;
  public setSession(sessionData: { accessToken: string; refreshToken: string }): void {
    this.session = sessionData;
    localStorage.setItem("user-session", JSON.stringify(sessionData));
  }

  public clearSession(): void {
    this.session = null;
    localStorage.removeItem("user-session");
  }


  private getRefreshToken(): string | null {
    return this.session?.refreshToken || null;
  }


  public readonly api = {
    user: {
      post: this.createEndpoint<CreateUserDto, UserResponseDto>("post", "/user"),
      get: this.createEndpoint<void, UserResponseDto[]>("get", "/user"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, UserResponseDto>("get", "/user/{id}", { id }),
        patch: this.createEndpoint<UpdateUserDto, UserResponseDto>("patch", "/user/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/user/{id}", { id }),
      }),
    },
    patients: {
      _userId: (userId: string) => ({
        post: this.createEndpoint<CreatePatientDto, PatientResponseDto>("post", "/patients/{userId}", { userId }),
      }),
      get: this.createEndpoint<void, PatientResponseDto[]>("get", "/patients"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, PatientResponseDto>("get", "/patients/{id}", { id }),
        put: this.createEndpoint<UpdatePatientDto, PatientResponseDto>("put", "/patients/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/patients/{id}", { id }),
      }),
      user: {
        _userId: (userId: string) => ({
          get: this.createEndpoint<void, PatientResponseDto>("get", "/patients/user/{userId}", { userId }),
        }),
      },
    },
    doctors: {
      post: this.createEndpoint<CreateDoctorDto, DoctorResponseDto>("post", "/doctors"),
      get: this.createEndpoint<void, {total:number,data:DoctorResponseDto[]}>("get", "/doctors"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, DoctorResponseDto>("get", "/doctors/{id}", { id }),
        patch: this.createEndpoint<UpdateDoctorDto, DoctorResponseDto>("patch", "/doctors/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/doctors/{id}", { id }),
      }),
      _id_availability: (id: string) => ({
        get: this.createEndpoint<void, any>("get", "/doctors/{id}/availability", { id }),
      }),
    },
    admin: {
      post: this.createEndpoint<CreateAdminDto, AdminResponseDto>("post", "/admin"),
      get: this.createEndpoint<void, AdminPaginatedDto>("get", "/admin"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, AdminResponseDto>("get", "/admin/{id}", { id }),
        patch: this.createEndpoint<UpdateAdminDto, AdminResponseDto>("patch", "/admin/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/admin/{id}", { id }),
      }),
    },
    pharmacists: {
      post: this.createEndpoint<CreatePharmacistDto, PharmacistResponseDto>("post", "/pharmacists"),
      get: this.createEndpoint<void, PharmacistResponseDto[]>("get", "/pharmacists"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, PharmacistResponseDto>("get", "/pharmacists/{id}", { id }),
        put: this.createEndpoint<UpdatePharmacistDto, PharmacistResponseDto>("put", "/pharmacists/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/pharmacists/{id}", { id }),
      }),
    },
    appointments: {
      post: this.createEndpoint<CreateAppointmentDto, AppointmentResponseDto>("post", "/appointments"),
      get: this.createEndpoint<void, {page:number, limit:number,total:number, data:AppointmentPaginatedDto[]}>("get", "/appointments"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, AppointmentResponseDto>("get", "/appointments/{id}", { id }),
        patch: this.createEndpoint<UpdateAppointmentDto, AppointmentResponseDto>("patch", "/appointments/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/appointments/{id}", { id }),
      }),
    },
    consultations: {
      post: this.createEndpoint<CreateConsultationDto, ConsultationResponseDto>("post", "/consultations"),
      get: this.createEndpoint<void, ConsultationPaginatedDto>("get", "/consultations"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, ConsultationResponseDto>("get", "/consultations/{id}", { id }),
        patch: this.createEndpoint<UpdateConsultationDto, ConsultationResponseDto>("patch", "/consultations/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/consultations/{id}", { id }),
      }),
    },
    prescriptions: {
      post: this.createEndpoint<CreatePrescriptionDto, PrescriptionResponseDto>("post", "/prescriptions"),
      get: this.createEndpoint<void, PrescriptionResponseDto[]>("get", "/prescriptions"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, PrescriptionResponseDto>("get", "/prescriptions/{id}", { id }),
        patch: this.createEndpoint<UpdatePrescriptionDto, PrescriptionResponseDto>("patch", "/prescriptions/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/prescriptions/{id}", { id }),
      }),
    },
    medicines: {
      post: this.createEndpoint<CreateMedicineDto, MedicineResponseDto>("post", "/medicines"),
      get: this.createEndpoint<void, MedicinePaginatedDto>("get", "/medicines"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, MedicineResponseDto>("get", "/medicines/{id}", { id }),
        patch: this.createEndpoint<UpdateMedicineDto, MedicineResponseDto>("patch", "/medicines/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/medicines/{id}", { id }),
      }),
      barcode: {
        _barcode: (barcode: string) => ({
          get: this.createEndpoint<void, MedicineResponseDto>("get", "/medicines/barcode/{barcode}", { barcode }),
        }),
      },
    },
    "inventory-items": {
      post: this.createEndpoint<CreateInventoryItemDto, InventoryItemResponseDto>("post", "/inventory-items"),
      get: this.createEndpoint<void, InventoryItemPaginatedDto>("get", "/inventory-items"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, InventoryItemResponseDto>("get", "/inventory-items/{id}", { id }),
        patch: this.createEndpoint<UpdateInventoryItemDto, InventoryItemResponseDto>("patch", "/inventory-items/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/inventory-items/{id}", { id }),
      }),
      _id_restock: (id: string) => ({
        patch: this.createEndpoint<void, InventoryItemResponseDto>("patch", "/inventory-items/{id}/restock", { id }),
      }),
    },
    pharmacies: {
      post: this.createEndpoint<CreatePharmacyDto, PharmacyResponseDto>("post", "/pharmacies"),
      get: this.createEndpoint<void, PharmacyResponseDto[]>("get", "/pharmacies"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, PharmacyResponseDto>("get", "/pharmacies/{id}", { id }),
        put: this.createEndpoint<UpdatePharmacyDto, PharmacyResponseDto>("put", "/pharmacies/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/pharmacies/{id}", { id }),
      }),
    },
    orders: {
      post: this.createEndpoint<CreateOrderDto, OrderResponseDto>("post", "/orders"),
      get: this.createEndpoint<void, OrderPaginatedDto>("get", "/orders"),
      _id: (id: string) => ({
        get: this.createEndpoint<void, OrderResponseDto>("get", "/orders/{id}", { id }),
        patch: this.createEndpoint<UpdateOrderDto, OrderResponseDto>("patch", "/orders/{id}", { id }),
        delete: this.createEndpoint<void, void>("delete", "/orders/{id}", { id }),
      }),
      _id_process_payment: (id: string) => ({
        patch: this.createEndpoint<void, OrderResponseDto>("patch", "/orders/{id}/process-payment", { id }),
      }),
      _id_cancel: (id: string) => ({
        patch: this.createEndpoint<void, OrderResponseDto>("patch", "/orders/{id}/cancel", { id }),
      }),
    },
    auth: {
      signup: {
        post: this.createEndpoint<SignUpDto,UserResponseDto >("post", "/auth/signup"),
      },
      login: {
        post: this.createEndpoint<LoginDto, { accessToken: string; refreshToken: string }>("post", "/auth/login"),
      },
      refresh: {
        post: this.createEndpoint<RefreshTokenDto, { accessToken: string; refreshToken: string }>("post", "/auth/refresh"),
      },
      verifyTokens: {
        post: this.createEndpoint<{ accessToken: string; refreshToken: string }, { success: boolean; message: string, userId:string }>(
          "post",
          "/auth/verify-tokens"
        ),
      },
      password: {
        forgot: {
          post: this.createEndpoint<ResetPasswordInitiateDto, void>("post", "/auth/password/forgot"),
        },
        reset: {
          post: this.createEndpoint<ResetPasswordConfirmDto, void>("post", "/auth/password/reset"),
        },
      },
      email: {
        update: {
          post: this.createEndpoint<UpdateEmailDto, void>("post", "/auth/email/update"),
        },
        verify:{
          post:this.createEndpoint<VerifyEmailDto, { accessToken: string; refreshToken: string }>("post","/auth/email/verify")
        }
      },
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
    const sessionData = localStorage.getItem("user-session");
    this.session = sessionData ? JSON.parse(sessionData) : null;

    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "",
      timeout: 300_000,
      headers: { "Content-Type": "application/json" },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const accessToken = this.getAccessToken();
        console.log("Url",config.baseURL,config.url,"Request Interceptor",accessToken)
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const isAuthRoute = originalRequest?.url?.includes("/auth/");

        // Skip handling for these cases
        if (!originalRequest ||
            error.response?.status !== 401 ||
            isAuthRoute ||
            originalRequest._retry) {
          return Promise.reject(error);
        }

        // Queue requests during refresh
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.refreshQueue.push({
              resolve: () => {
                originalRequest.headers.Authorization = `Bearer ${this.getAccessToken()}`;
                resolve(this.axiosInstance(originalRequest));
              },
              reject
            });
          });
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const refreshToken = this.getRefreshToken();
          if (!refreshToken) throw new Error("No refresh token available");

          // Use a separate axios instance for token refresh
          const refreshClient = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL,
            headers: { "Content-Type": "application/json" },
          });

          const response = await refreshClient.post<{
            accessToken: string;
            refreshToken: string;
          }>("/auth/refresh", { refreshToken });

          // Update session with new tokens
          this.setSession({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          });

          // Update original request headers
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

          // Process queued requests
          this.refreshQueue.forEach((cb) => cb.resolve(response.data.accessToken));

          return this.axiosInstance(originalRequest);
        } catch (refreshError) {
          // Clear session and reject queued requests
          this.clearSession();
          this.refreshQueue.forEach((cb) => cb.reject(refreshError));
          this.refreshQueue = [];

          // Redirect to login if not already on auth page
          if (!window.location.pathname.startsWith("/auth")) {
            redirect({ to: "/auth/signin" });
          }

          return Promise.reject(new Error("Session expired. Please log in again."));
        } finally {
          this.isRefreshing = false;
        }
      }
    );
  }
}

export const dataServices = new DataServices();
