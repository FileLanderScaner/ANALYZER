"use client";

import React, { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast'; // Assuming you have a toast component
import { useRouter } from 'next/navigation';

declare const paypal: any; // Declare paypal to avoid TypeScript errors

interface PayPalButtonProps {
  amount: number | string;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ amount }) => {
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    // Check if the PayPal SDK is loaded
    if (typeof paypal !== 'undefined') {
      paypal.Buttons({
        createOrder: function(data: any, actions: any) {
          // Call your backend API to create the order
          return fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(order => {
            console.log('PayPal Order created:', order.orderId);
            return order.orderId; // Return the order ID from the backend
          })
          .catch(error => {
            console.error('Error creating PayPal order:', error);
            toast({
              variant: "destructive",
              title: "Error de pago",
              description: "No se pudo iniciar la transacción de PayPal.",
            });
            // You might want to disable the buttons or show an error message here
          });
        },
        onApprove: function(data: any, actions: any) {
          // Call your backend API to capture the order
          return fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: data.orderID }), // Use data.orderID from the client-side data
          })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(captureDetails => {
            console.log('PayPal payment captured:', captureDetails);
            // Redirect on successful capture
            router.push('/payment-success');
          })
          .catch(error => {
            console.error('Error capturing PayPal payment:', error);
            toast({
              variant: "destructive",
              title: "Error de pago",
              description: "No se pudo completar la transacción de PayPal.",
            });
          });
        },
        onError: function(err: any) {
            console.error('PayPal Button Error:', err);
             toast({
              variant: "destructive",
              title: "Error de PayPal",
              description: "Ocurrió un error con los botones de PayPal.",
            });
        }
      }).render('#paypal-button-container');
    } else {
      console.warn('PayPal SDK not loaded yet.');
    }
  }, [amount]); // Add amount to dependency array if you expect it to change

  return (
    <div id="paypal-button-container"></div>
  );
};

export default PayPalButton;