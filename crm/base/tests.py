from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User


class LandingLoginLaunchpadFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='secret123')

    def test_root_route_uses_landing_template(self):
        response = self.client.get(reverse('landing'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'base/landing.html')

    def test_login_route_and_success_redirect_to_launchpad(self):
        login_page = self.client.get(reverse('login'))
        self.assertEqual(login_page.status_code, 200)
        self.assertTemplateUsed(login_page, 'base/login.html')

        post_login = self.client.post(reverse('login'), {
            'username': self.user.username,
            'password': 'secret123',
        }, follow=True)

        self.assertRedirects(post_login, reverse('launchpad'), fetch_redirect_response=False)
