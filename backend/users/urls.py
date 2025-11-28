from django.urls import path
from . import views

urlpatterns = [
    path('', views.client_list, name='client-list'),
    path('<int:client_id>/appointments/', views.client_appointments, name='client-appointments'),
]