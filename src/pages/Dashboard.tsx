import React from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../stores/authStore';

function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Productos',
      value: '2,345',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Órdenes Pendientes',
      value: '12',
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Stock Bajo',
      value: '8',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Despachos Hoy',
      value: '45',
      icon: Truck,
      color: 'bg-green-500',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Despacho completado',
      description: 'Orden #1234 - Sucursal Osorno',
      timestamp: 'Hace 5 minutos',
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      id: 2,
      action: 'Stock bajo detectado',
      description: 'Producto: Limpiador Multiuso 1L',
      timestamp: 'Hace 15 minutos',
      icon: AlertTriangle,
      color: 'text-yellow-500',
    },
    // Add more activities as needed
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.email}
          </h1>
          <p className="text-gray-600">
            Panel de Control - {new Date().toLocaleDateString('es-CL')}
          </p>
        </div>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Nueva Orden
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Actividad Reciente
          </h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="flex items-start p-4 bg-gray-50 rounded-lg"
              >
                <Icon className={`w-5 h-5 ${activity.color} mt-1`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;