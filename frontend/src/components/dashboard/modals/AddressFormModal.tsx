import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { z } from "zod";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { addressSchema, type AddressFormValues } from "@/zod/address";

const validateWithZod = (schema: z.ZodSchema) => (values: any) => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        errors[key] = issue.message;
    });
    return errors;
};

export function AddressFormModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.addressForm;

    const isEdit = data?.mode === "edit";

    const formik = useFormik<AddressFormValues>({
        initialValues: {
            street: data?.addressData?.street || "",
            city: data?.addressData?.city || "",
            province: data?.addressData?.province || "",
            country: data?.addressData?.country || "",
            postal_code: data?.addressData?.postal_code || "",
            is_default: data?.addressData?.is_default || false,
        },
        validate: validateWithZod(addressSchema),
        enableReinitialize: true,
        onSubmit: (values, { setSubmitting }) => {
            console.log("Submitted Modal", values);
            setSubmitting(false);
            closeModal("addressForm");
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal("addressForm")}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Address" : "Add Address"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Make changes to your address here." : "Add a new shipping and billing address."} Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={formik.handleSubmit} className="space-y-4 pt-2">
                    <div className="grid gap-2">
                        <Label htmlFor="street">Street Address</Label>
                        <Input id="street" placeholder="123 Example St" {...formik.getFieldProps("street")} />
                        {formik.touched.street && formik.errors.street && (
                            <p className="text-destructive text-sm font-medium">{formik.errors.street}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" placeholder="Toronto" {...formik.getFieldProps("city")} />
                            {formik.touched.city && formik.errors.city && (
                                <p className="text-destructive text-sm font-medium">{formik.errors.city}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="province">State/Province</Label>
                            <Input id="province" placeholder="ON" {...formik.getFieldProps("province")} />
                            {formik.touched.province && formik.errors.province && (
                                <p className="text-destructive text-sm font-medium">{formik.errors.province}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="postal_code">Zip/Postal Code</Label>
                            <Input id="postal_code" placeholder="M5V 2H1" {...formik.getFieldProps("postal_code")} />
                            {formik.touched.postal_code && formik.errors.postal_code && (
                                <p className="text-destructive text-sm font-medium">{formik.errors.postal_code}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" placeholder="Canada" {...formik.getFieldProps("country")} />
                            {formik.touched.country && formik.errors.country && (
                                <p className="text-destructive text-sm font-medium">{formik.errors.country}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                        <div className="space-y-0.5">
                            <Label className="text-base">Set as Default</Label>
                            <p className="text-muted-foreground text-sm">Make this your primary address.</p>
                        </div>
                        <Switch checked={formik.values.is_default} onCheckedChange={(checked) => formik.setFieldValue("is_default", checked)} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => closeModal("addressForm")}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={formik.isSubmitting}>
                            Save Address
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
