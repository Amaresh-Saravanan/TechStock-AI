from django.urls import path
from .views import ChatView, BuildGeneratorView, DashboardView, ChatStatusView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='ai_chat'),
    path('generate-build/', BuildGeneratorView.as_view(), name='ai_generate_build'),
    path('analytics/dashboard/', DashboardView.as_view(), name='analytics_dashboard'),
    path('chat/status/', ChatStatusView.as_view(), name='chat_status'),
]
