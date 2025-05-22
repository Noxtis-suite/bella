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
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Bella Konfirmation 2025!</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
          Del dine øjeblikke med os! Klik på "Send billede" for at uploade dine fotos fra konfirmationen!
        </p>
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Send billede
          </button>
          <Link href="/qr-code" className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center">
            Se QR Kode
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {images?.map((image) => (
          <div key={image.name} className="relative aspect-square overflow-hidden rounded-lg shadow-md">
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-photos/${image.name}`}
              alt="Event photo"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
