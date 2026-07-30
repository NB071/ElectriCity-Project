import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useUiStore } from "@/stores/ui-store";

export type GalleryImage = {
    url: string;
    alt_text: string | null;
    display_order: number;
};

export function VehicleImageGalleryModal() {
    const { isOpen, data } = useUiStore((s) => s.modals.imageGallery);
    const closeModal = useUiStore((s) => s.closeModal);
    const images = data?.images || [];

    if (!images.length) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal("imageGallery")}>
            <DialogContent className="[&>button]:bg-background/20 [&>button]:hover:bg-background/40 border-none bg-gray-950 p-0 shadow-2xl sm:max-w-5xl [&>button]:rounded-md [&>button]:p-1.5 [&>button]:text-white [&>button]:opacity-100">
                <div className="relative w-full overflow-hidden">
                    <Carousel className="w-full">
                        <CarouselContent>
                            {images.map((img, i) => (
                                <CarouselItem key={i}>
                                    <div className="flex h-[50vh] w-full items-center justify-center p-6">
                                        <img src={img.url} alt={img.alt_text || "Vehicle view"} className="max-h-full max-w-full object-contain" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="bg-background/20 hover:bg-background/40 left-6 rounded-md border-none text-white transition-opacity hover:text-white data-[disabled=true]:opacity-0 sm:left-8" />
                        <CarouselNext className="bg-background/20 hover:bg-background/40 right-6 rounded-md border-none text-white transition-opacity hover:text-white data-[disabled=true]:opacity-0 sm:right-8" />
                    </Carousel>
                </div>
            </DialogContent>
        </Dialog>
    );
}
