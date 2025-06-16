'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  Database,
  FileText,
  CheckCircle2,
  Clock,
  Bell,
  Cpu,
  BarChart3,
  Settings,
  Upload,
  Download,
  RefreshCw,
  Eye,
  Layers,
  Network,
  Gauge
} from 'lucide-react';

const aiFeatures = [
  {
    category: "Model Training & Optimization",
    icon: Brain,
    color: "from-purple-500 to-purple-600",
    description: "Advanced machine learning capabilities for e-waste classification",
    features: [
      "Automated model retraining with new data",
      "Performance monitoring and optimization",
      "A/B testing for model improvements",
      "Custom training data validation",
      "Real-time accuracy tracking"
    ]
  },
  {
    category: "Data Management",
    icon: Database,
    color: "from-blue-500 to-blue-600",
    description: "Intelligent data processing and quality assurance",
    features: [
      "Smart data labeling and annotation",
      "Automated data quality checks",
      "Training dataset management",
      "Data augmentation techniques",
      "Bias detection and mitigation"
    ]
  },
  {
    category: "Performance Analytics",
    icon: BarChart3,
    color: "from-green-500 to-green-600",
    description: "Comprehensive insights into AI model performance",
    features: [
      "Real-time accuracy metrics",
      "Confusion matrix analysis",
      "Category-specific performance tracking",
      "Model drift detection",
      "Performance trend analysis"
    ]
  },
  {
    category: "Automated Workflows",
    icon: Zap,
    color: "from-yellow-500 to-yellow-600",
    description: "Streamlined AI operations and maintenance",
    features: [
      "Scheduled retraining sessions",
      "Automated model deployment",
      "Performance threshold alerts",
      "Continuous learning pipelines",
      "Smart resource allocation"
    ]
  }
];

const capabilities = [
  {
    title: "Image Recognition",
    description: "Advanced computer vision for e-waste identification",
    icon: Eye,
    progress: 85,
    color: "bg-blue-500"
  },
  {
    title: "Category Classification",
    description: "Precise categorization of electronic waste types",
    icon: Layers,
    progress: 92,
    color: "bg-green-500"
  },
  {
    title: "Quality Assessment",
    description: "Automated condition and value estimation",
    icon: Gauge,
    progress: 78,
    color: "bg-yellow-500"
  },
  {
    title: "Pattern Recognition",
    description: "Learning from user corrections and feedback",
    icon: Network,
    progress: 88,
    color: "bg-purple-500"
  }
];

const FeatureCard = ({ category, icon: Icon, color, description, features }: any) => (
  <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity`} />
    <CardHeader className="pb-4">
      <div className="flex items-start space-x-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-gray-900">{category}</CardTitle>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-600 text-xs">
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

const CapabilityCard = ({ title, description, icon: Icon, progress, color }: any) => (
  <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl ${color} shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Accuracy</span>
              <span className="font-medium text-gray-900">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AITrainingPage() {
  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#69C0DC] to-[#5BA8C4] shadow-lg">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">AI Training Center</h1>
            <p className="text-gray-600 mt-2">Advanced machine learning for e-waste classification</p>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-[#69C0DC]/10 to-[#5BA8C4]/10 rounded-2xl p-6 border border-[#69C0DC]/20">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Cpu className="h-5 w-5 text-[#69C0DC] animate-pulse" />
              <Badge className="bg-[#69C0DC] text-white px-3 py-1 rounded-full">
                Under Development
              </Badge>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Next-Generation AI Training</h2>
            <p className="text-gray-600 leading-relaxed">
              Our AI Training Center will revolutionize how the system learns and improves. Using advanced machine learning 
              techniques, it will continuously enhance e-waste classification accuracy, learn from user corrections, 
              and adapt to new waste categories automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Current AI Capabilities */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Current AI Capabilities</h3>
          <p className="text-gray-600">Our existing AI system performance metrics</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((capability, index) => (
            <CapabilityCard key={index} {...capability} />
          ))}
        </div>
      </div>

      {/* Upcoming Features */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">What's Coming</h3>
          <p className="text-gray-600">Advanced AI training and optimization features</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {aiFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-5xl mx-auto">
        <Card className="border-0 shadow-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">How AI Training Will Work</CardTitle>
            <p className="text-gray-600 mt-2">A seamless, automated approach to continuous improvement</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mx-auto w-fit">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Data Collection</h4>
                <p className="text-sm text-gray-600">
                  Automatically collect and process new e-waste images, user corrections, and classification feedback
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg mx-auto w-fit">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Model Training</h4>
                <p className="text-sm text-gray-600">
                  Retrain AI models with new data, optimize parameters, and validate improvements automatically
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg mx-auto w-fit">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Performance Boost</h4>
                <p className="text-sm text-gray-600">
                  Deploy improved models, monitor performance metrics, and ensure continuous accuracy enhancement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <h3 className="text-2xl font-bold text-gray-900">Q3 2024</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our AI research team is developing cutting-edge machine learning capabilities that will make 
                e-waste classification more accurate and intelligent than ever before. The system will learn 
                from every interaction and continuously improve its performance.
              </p>
              <div className="flex items-center justify-center space-x-4 pt-4">
                <Button variant="outline" className="rounded-xl">
                  <Bell className="mr-2 h-4 w-4" />
                  Get Notified
                </Button>
                <Button className="bg-[#69C0DC] hover:bg-[#5BA8C4] text-white rounded-xl">
                  <FileText className="mr-2 h-4 w-4" />
                  Technical Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 