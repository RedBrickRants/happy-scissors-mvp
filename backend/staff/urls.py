from django.urls import path
from . import views

urlpatterns = [
    path('', views.staff_list, name='staff-list'),
    path('create/', views.staff_create, name='staff-create'),
    path('<int:staff_id>/delete/', views.staff_delete, name='staff-delete'),
    path('<int:staff_id>/edit/', views.staff_edit, name='staff-edit'), 

]