'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Shield,
  Users,
  Bell,
  Palette,
  Database,
  Mail,
  Globe,
  Lock,
  Key,
  Server,
  Cloud,
  HardDrive,
  Wifi,
  Smartphone,
  Monitor,
  Volume2,
  Camera,
  FileText,
  Image as ImageIcon,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Target,
  TrendingUp,
  Wrench,
  Cog,
  CheckCircle2
} from 'lucide-react';

const upcomingFeatures = [
  {
    category: "System Configuration",
    icon: Settings,
    color: "from-blue-500 to-blue-600",
    features: [
      "Site name and branding customization",
      "Timezone and localization settings",
      "Currency and date format configuration",
      "System maintenance mode"
    ]
  },
  {
    category: "Security & Access",
    icon: Shield,
    color: "from-red-500 to-red-600",
    features: [
      "Two-factor authentication setup",
      "Password policies and expiration",
      "IP whitelist management",
      "Session timeout configuration",
      "Audit logging and monitoring"
    ]
  },
  {
    category: "User Management",
    icon: Users,
    color: "from-green-500 to-green-600",
    features: [
      "Role-based access control",
      "User permissions management",
      "Account approval workflows",
      "Bulk user operations"
    ]
  },
  {
    category: "Notifications",
    icon: Bell,
    color: "from-yellow-500 to-yellow-600",
    features: [
      "Email notification templates",
      "Push notification settings",
      "SMS alert configuration",
      "System alert preferences",
      "Weekly report scheduling"
    ]
  },
  {
    category: "Integrations",
    icon: Globe,
    color: "from-purple-500 to-purple-600",
    features: [
      "Google Analytics integration",
      "SMTP email configuration",
      "Cloud storage setup (AWS, GCP)",
      "Third-party API connections",
      "Webhook configurations"
    ]
  },
  {
    category: "Data & Backup",
    icon: Database,
    color: "from-indigo-500 to-indigo-600",
    features: [
      "Automated backup scheduling",
      "Data export and import tools",
      "Database optimization settings",
      "Storage quota management",
      "Data retention policies"
    ]
  }
];

const FeatureCard = ({ category, icon: Icon, color, features }: any) => (
  <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
    <CardHeader className="pb-4">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">{category}</CardTitle>
          <Badge variant="secondary" className="mt-1 bg-gray-100 text-gray-600 text-xs">
            Coming Soon
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <ul className="space-y-2">
        {features.map((feature: string, index: number) => (
          <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
            <CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#69C0DC] to-[#5BA8C4] shadow-lg">
            <Wrench className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Advanced configuration and management tools</p>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-[#69C0DC]/10 to-[#5BA8C4]/10 rounded-2xl p-6 border border-[#69C0DC]/20">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Cog className="h-5 w-5 text-[#69C0DC] animate-spin" />
              <Badge className="bg-[#69C0DC] text-white px-3 py-1 rounded-full">
                Under Development
              </Badge>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon!</h2>
            <p className="text-gray-600 leading-relaxed">
              We're building a comprehensive settings panel that will give you complete control over your 
              e-waste management system. Configure everything from security policies to notification preferences, 
              all from one centralized location.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">What's Coming</h3>
          <p className="text-gray-600">Powerful features to customize and optimize your system</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto text-center">
        <Card className="bg-gradient-to-r from-gray-50 to-white border-0 shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5 text-[#69C0DC]" />
                <span className="text-sm font-medium text-gray-600">Estimated Release</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Q2 2024</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our development team is working hard to bring you these powerful configuration tools. 
                Stay tuned for updates and be the first to experience the enhanced admin capabilities.
              </p>
              <div className="flex items-center justify-center space-x-4 pt-4">
                <Button variant="outline" className="rounded-xl">
                  <Bell className="mr-2 h-4 w-4" />
                  Notify Me
                </Button>
                <Button className="bg-[#69C0DC] hover:bg-[#5BA8C4] text-white rounded-xl">
                  <FileText className="mr-2 h-4 w-4" />
                  View Roadmap
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 