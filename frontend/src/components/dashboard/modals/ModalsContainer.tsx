import { AddressFormModal } from "./AddressFormModal";
import { AddressDeleteModal } from "./AddressDeleteModal";
import { PasswordSuccessModal } from "./PasswordSuccessModal";
import { SessionRevokeModal } from "@/components/dashboard/modals/SessionRevokeModal";
import { SessionRevokeAllModal } from "@/components/dashboard/modals/SessionRevokeAllModal";
import { OrderDetailModal } from "@/components/dashboard/modals/OrderDetailModal";
import { PaymentDetailModal } from "@/components/dashboard/modals/PaymentDetailModal";
import { AnalyticsEventDetailModal } from "@/components/dashboard/modals/AnalyticsEventDetailModal";
import { WishlistDeleteModal } from "@/components/dashboard/modals/WishlistDeleteModal";
import { ReviewDeleteModal } from "@/components/dashboard/modals/ReviewDeleteModal";
import { UserDetailModal } from "@/components/dashboard/modals/UserDetailModal";
import { MediaDeleteModal } from "@/components/dashboard/modals/MediaDeleteModal";
import { MediaLinkModal } from "@/components/dashboard/modals/MediaLinkModal";
import { MediaRegisterModal } from "@/components/dashboard/modals/MediaRegisterModal";
import { VehicleImageGalleryModal } from "@/components/shop/catalog/VehicleImageGalleryModal";

export function ModalsContainer() {
    return (
        <>
            <AddressFormModal />
            <AddressDeleteModal />
            <PasswordSuccessModal />
            <SessionRevokeModal />
            <SessionRevokeAllModal />
            <OrderDetailModal />
            <PaymentDetailModal />
            <AnalyticsEventDetailModal />
            <WishlistDeleteModal />
            <ReviewDeleteModal />
            <UserDetailModal />
            <MediaDeleteModal />
            <MediaLinkModal />
            <MediaRegisterModal />
            <VehicleImageGalleryModal />
        </>
    );
}
