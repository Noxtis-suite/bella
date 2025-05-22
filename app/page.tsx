import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch images from storage
  const { data: images } = await supabase
    .storage
    .from('event-photos')
    .list();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Bella Konfirmation 2025!</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Del dine øjeblikke med os! Klik på "Send billede" for at uploade dine fotos fra konfirmationen!
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Send billede
          </button>
          <Link href="/qr-code" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Se QR Kode
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images?.map((image) => (
          <div key={image.name} className="relative aspect-square overflow-hidden rounded-lg shadow-md">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${image.name}`}
              alt="Event photo"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
