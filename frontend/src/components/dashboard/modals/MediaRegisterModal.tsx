import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { mediaRegisterSchema, type MediaRegisterValues } from "@/zod/mediaRegister";

export function MediaRegisterModal() {
    const { modals, closeModal } = useUiStore();
    const config = modals.mediaRegister;

    const onClose = () => {
        closeModal("mediaRegister");
    };

    const initialValues: MediaRegisterValues = {
        url: "",
        file_type: "image/jpeg",
        alt_text: "",
        cid: "" as unknown as number,
    };

    const handleSubmit = (values: MediaRegisterValues, { setSubmitting }: any) => {
        const payload = {
            ...values,
            cid: typeof values.cid === "number" ? values.cid : undefined,
        };
        console.log("Registering newly mapped media via API:", payload);
        // TODO: logic
        setSubmitting(false);
        onClose();
    };

    return (
        <Dialog open={config.isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register External Media</DialogTitle>
                </DialogHeader>

                <Formik<MediaRegisterValues>
                    initialValues={initialValues}
                    validationSchema={toFormikValidationSchema(mediaRegisterSchema)}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, isValid, dirty, setFieldValue, values }) => (
                        <Form className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="url">Direct Media URL</Label>
                                <Field as={Input} id="url" name="url" placeholder="https://..." />
                                <ErrorMessage name="url" component="div" className="text-destructive text-xs" />
                            </div>

                            <div className="space-y-2">
                                <Label>File Type</Label>
                                <Select value={values.file_type} onValueChange={(val) => setFieldValue("file_type", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select file format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="image/jpeg">JPEG Image</SelectItem>
                                        <SelectItem value="image/png">PNG Image</SelectItem>
                                        <SelectItem value="image/webp">WebP Image</SelectItem>
                                        <SelectItem value="image/gif">GIF Image</SelectItem>
                                        <SelectItem value="application/pdf">PDF Document</SelectItem>
                                    </SelectContent>
                                </Select>
                                <ErrorMessage name="file_type" component="div" className="text-destructive text-xs" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alt_text">Alt Text (Optional)</Label>
                                <Field as={Input} id="alt_text" name="alt_text" placeholder="Description for screen readers" />
                                <ErrorMessage name="alt_text" component="div" className="text-destructive text-xs" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cid">Catalog ID (Optional)</Label>
                                <Field as={Input} id="cid" name="cid" type="number" placeholder="Numeric CID to auto-link" />
                                <ErrorMessage name="cid" component="div" className="text-destructive text-xs" />
                            </div>

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!isValid || !dirty || isSubmitting}>
                                    {isSubmitting ? "Registering..." : "Register Media"}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}
