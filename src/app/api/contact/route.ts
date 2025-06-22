// src/app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer'; // Asegúrate de que esta línea esté correcta

// Define un esquema para validar los datos del formulario
const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, ingrese un correo electrónico válido." }),
  company: z.string().optional(),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = ContactFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Datos de entrada inválidos.", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, company, message } = validation.data;

    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Cambia esto según tu proveedor
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: 'akuma_g1@hotmail.com',
      subject: `Nuevo mensaje de contacto de: ${name} ${company ? `(${company})` : ''}`,
      text: `Has recibido un nuevo mensaje de contacto:\n\nNombre: ${name}\nEmail: ${email}\nEmpresa: ${company || 'N/A'}\n\nMensaje:\n${message}`,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Mensaje enviado exitosamente." });

  } catch (error) {
    console.error("API /api/contact: Error procesando la solicitud:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}