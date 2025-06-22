
import { createClient } from '@/lib/supabase/server'; // Adjusted import path
import type { Note } from '@/types'; // Assuming you might create a Note type

export const revalidate = 0; // Or some other revalidation strategy if needed

export default async function NotesPage() {
  const supabase = createClient(); // Use the server client
  
  // The type assertion `as Note[]` is optimistic.
  // Proper error handling and type checking should be added for production.
  const { data: notes, error } = await supabase.from("notes").select();

  if (error) {
    console.error("Error fetching notes:", error);
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Error al Cargar Notas</h1>
        <p className="text-red-500">No se pudieron cargar las notas desde Supabase. Revisa la consola del servidor para más detalles.</p>
        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
         <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Notas</h1>
            <p>No se encontraron notas. Asegúrate de haber creado la tabla 'notes' y añadido algunos datos y políticas RLS en tu proyecto Supabase según las instrucciones del README.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Puedes añadir la tabla y los datos de ejemplo ejecutando el SQL proporcionado en el Editor SQL de Supabase.
            </p>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Notas desde Supabase</h1>
      <div className="bg-card p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3 text-card-foreground">Datos Crudos (JSON):</h2>
        <pre className="bg-muted p-3 rounded-md text-xs text-muted-foreground overflow-x-auto">
          {JSON.stringify(notes, null, 2)}
        </pre>
      </div>
      <div className="mt-6 bg-card p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3 text-card-foreground">Notas Individuales:</h2>
        <ul className="space-y-2">
          {(notes as Note[]).map((note) => (
            <li key={note.id} className="p-3 border rounded-md bg-secondary/50 text-secondary-foreground">
              <strong className="text-primary">ID:</strong> {note.id} - <strong className="text-primary">Título:</strong> {note.title}
            </li>
          ))}
        </ul>
      </div>
       <p className="mt-6 text-sm text-muted-foreground">
        Esta página es un ejemplo de cómo obtener datos desde una tabla de Supabase en una aplicación Next.js usando Server Components.
        Asegúrate de haber configurado correctamente tus variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
        También, verifica que la tabla `notes` exista en tu base de datos Supabase y que las políticas de Seguridad a Nivel de Fila (RLS) permitan la lectura para el rol `anon` (o el rol autenticado si es necesario).
      </p>
    </div>
  );
}
