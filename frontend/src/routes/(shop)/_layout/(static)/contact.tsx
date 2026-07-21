import { createFileRoute } from "@tanstack/react-router";
import { StaticPageTemplate } from "@/components/common/StaticPageTemplate";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue with bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { contactSchema, type ContactFormData } from "@/zod/contact";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/(shop)/_layout/(static)/contact")({
    component: ContactRoute,
});

function ContactRoute() {
    const formik = useFormik<ContactFormData>({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            comment: "",
        },
        validationSchema: toFormikValidationSchema(contactSchema),
        onSubmit: (values) => {
            console.log("Contact form submitted:", values);
            alert("Message sent successfully!");
            formik.resetForm();
        },
    });

    return (
        <StaticPageTemplate title="Contact Us">
            <div className="mx-auto w-full max-w-6xl px-4 text-black lg:px-8">
                {/* Map Section */}
                <div className="border-border mt-8 mb-16 h-100 w-full overflow-hidden rounded-xl border">
                    <MapContainer center={[43.7735, -79.5019]} zoom={14} scrollWheelZoom={false} className="relative z-0 h-full w-full">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[43.7735, -79.5019]}>
                            <Popup>York University, Toronto</Popup>
                        </Marker>
                    </MapContainer>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-3">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight">Get In Touch</h2>
                        <p className="text-muted-foreground mb-8 max-w-xl text-sm">
                            Have questions about our catalog, financing options, or a recent order? Send us a message and our support team will get
                            back to you shortly.
                        </p>

                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="text-muted-foreground ml-1 text-xs font-semibold">
                                        First Name
                                    </label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        className={`flex h-12 w-full rounded-md border ${formik.touched.firstName && formik.errors.firstName ? "border-red-500" : "border-input"} bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                        placeholder="Ali"
                                        value={formik.values.firstName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.firstName && formik.errors.firstName && (
                                        <p className="mt-1 ml-1 text-xs font-medium text-red-500">{formik.errors.firstName}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="text-muted-foreground ml-1 text-xs font-semibold">
                                        Last Name
                                    </label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        className={`flex h-12 w-full rounded-md border ${formik.touched.lastName && formik.errors.lastName ? "border-red-500" : "border-input"} bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                        placeholder="Tufan"
                                        value={formik.values.lastName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.lastName && formik.errors.lastName && (
                                        <p className="mt-1 ml-1 text-xs font-medium text-red-500">{formik.errors.lastName}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-muted-foreground ml-1 text-xs font-semibold">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className={`flex h-12 w-full rounded-md border ${formik.touched.email && formik.errors.email ? "border-red-500" : "border-input"} bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                        placeholder="creativelayers088@gmail.com"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <p className="mt-1 ml-1 text-xs font-medium text-red-500">{formik.errors.email}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-muted-foreground ml-1 text-xs font-semibold">
                                        Phone
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        className={`border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-12 w-full rounded-md border px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                        placeholder="+1 (555) 555-5555"
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="comment" className="text-muted-foreground ml-1 text-xs font-semibold">
                                    Comment
                                </label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    className={`flex w-full rounded-md border ${formik.touched.comment && formik.errors.comment ? "border-red-500" : "border-input"} bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-30 px-4 py-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                                    placeholder="Write your comment here..."
                                    rows={5}
                                    value={formik.values.comment}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                {formik.touched.comment && formik.errors.comment && (
                                    <p className="mt-1 ml-1 text-xs font-medium text-red-500">{formik.errors.comment}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="ring-offset-background focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                            >
                                Send Message{" "}
                                <span className="ml-2">
                                    <ArrowUpRight size={16} />
                                </span>
                            </button>
                        </form>
                    </div>

                    {/* Right Column - Contact Details */}
                    <div className="lg:col-span-2">
                        <div className="rounded-lg border p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl">
                            <h3 className="mb-4 text-xl font-bold">Contact details</h3>
                            <p className="text-muted-foreground mb-8 text-sm">
                                Reach out to us directly via phone or email during business hours, or visit us at one of our interactive showrooms.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                                        <MapPin size={16} color="black" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Address</p>
                                        <p className="text-muted-foreground text-sm text-wrap">4700 Keele St, North York, ON M3J 1P3</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                                        <Mail size={16} color="black" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Email</p>
                                        <p className="text-muted-foreground text-sm text-wrap">eecs4413.group.g@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                                        <Phone size={16} color="black" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Phone</p>
                                        <p className="text-muted-foreground text-sm text-wrap">+1 (123) 456-7890</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <p className="mb-2 text-sm font-semibold">Follow us</p>
                                <div className="flex gap-3">
                                    <SocialLink href="#" icon={FaFacebookF} />
                                    <SocialLink href="#" icon={FaTwitter} />
                                    <SocialLink href="#" icon={FaInstagram} />
                                    <SocialLink href="#" icon={FaLinkedinIn} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Offices Section */}
                <div className="mt-24 mb-8">
                    <h2 className="mb-10 text-3xl font-bold tracking-tight">Our Offices</h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <OfficeInfo
                            City="Toronto"
                            address="290 Bremner Blvd, Toronto, ON M5V 3L9"
                            mapURL="#"
                            email="eecs4413.group.g@gmail.com"
                            phone="+1 (123) 456-7890"
                        />
                        <OfficeInfo
                            City="Markham"
                            address="1 University Blvd., Markham, ON L6G 0H2"
                            mapURL="#"
                            email="eecs4413.group.g@gmail.com"
                            phone="+1 (123) 456-7890"
                        />
                        <OfficeInfo
                            City="North York"
                            address="2275 Bayview Ave, North York, ON M4N 3M6"
                            mapURL="#"
                            email="eecs4413.group.g@gmail.com"
                            phone="+1 (123) 456-7890"
                        />
                    </div>
                </div>
            </div>
        </StaticPageTemplate>
    );
}

const OfficeInfo = ({ City, address, mapURL, email, phone }) => {
    return (
        <div className="space-y-4">
            <h4 className="text-lg font-bold">{City}</h4>
            <p className="text-muted-foreground text-sm">{address}</p>
            <a
                href={mapURL}
                rel="noopener noreferrer"
                target="_blank"
                className="text-foreground flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
            >
                See on Map <ArrowUpRight size={16} />
            </a>
            <div className="mt-6 flex flex-col gap-3">
                <div className="text-muted-foreground/80 flex items-center gap-2 text-sm">
                    <Mail size={16} className="shrink-0" color="black" />
                    <a href={`mailto:${email}`} className="break-all hover:underline">
                        {email}
                    </a>
                </div>
                <div className="text-muted-foreground/80 flex items-center gap-2 text-sm">
                    <Phone size={16} className="shrink-0" color="black" />
                    <a href={`tel:${phone}`} className="break-all hover:underline">
                        {phone}
                    </a>
                </div>
            </div>
        </div>
    );
};

const SocialLink = ({ href, icon: Icon }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 hover:bg-gray-200/20 hover:text-blue-600"
    >
        <Icon size={14} />
    </a>
);
