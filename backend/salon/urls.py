from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/staff/', include('staff.urls')),
    path('api/services/', include('services.urls')),
    path('api/users/', include('users.urls')),
]