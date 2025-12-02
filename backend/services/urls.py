from django.urls import path
from . import views

urlpatterns = [
    path('', views.service_list, name='service-list'),
    path('<int:service_id>/edit/', views.service_edit, name='service-edit'),
    path('create/', views.service_create, name='service-create'),
    path('<int:service_id>/delete/', views.service_delete, name='service-delete'),
]