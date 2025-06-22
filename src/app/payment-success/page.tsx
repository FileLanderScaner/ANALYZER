// src/app/payment-success/page.tsx
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-md w-full space-y-8 text-center">
        <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
        <h2 className="mt-6 text-3xl font-extrabold">
          ¡Pago Procesado con Éxito!
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Gracias por tu compra. Tu pago ha sido procesado y tu suscripción/servicio ha sido actualizado.
        </p>
        <div className="mt-6">
          <Link href="/" className="font-medium text-primary hover:underline">
            Volver a la página de inicio
          </Link>
        </div>
      </div>
    </div>
  );
}