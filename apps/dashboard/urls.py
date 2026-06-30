from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.AdminDashboardView.as_view()),
    path('agents/', views.AgentTrainerListView.as_view()),
    path('agents/<int:pk>/',views.AgentTrainerDetailView.as_view()),
]
