import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Formik, Form } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { mediaRegisterSchema, type MediaRegisterValues } from "@/zod/mediaRegister";
import { useRegisterAdminMedia } from "@/hooks/api/media/use-admin-media";

export function MediaRegisterModal() {
    const { modals, closeModal } = useUiStore();
    const config = modals.mediaRegister;
    const registerMedia = useRegisterAdminMedia();

    const onClose = () => {
        closeModal("mediaRegister");
    };

    const initialValues: MediaRegisterValues = {
        url: "",
        file_type: "image/jpeg",
        alt_text: "",
        cid: undefined,
    };

    const handleSubmit = (values: MediaRegisterValues, { setSubmitting }: { setSubmitting: (pending: boolean) => void }) => {
        const payload = {
            url: values.url,
            file_type: values.file_type,
            ...(values.alt_text?.trim() ? { alt_text: values.alt_text.trim() } : {}),
            ...(typeof values.cid === "number" ? { cid: values.cid } : {}),
        };

        registerMedia.mutate(
            { body: payload },
            {
                onSuccess: () => {
                    setSubmitting(false);
                    onClose();
                },
                onError: () => {
                    setSubmitting(false);
                },
            },
        );
    };

    return (
        <Dialog open={config.isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register External Media</DialogTitle>
                    <DialogDescription>Create a media record from a URL. Optionally link it to a catalog item immediately.</DialogDescription>
                </DialogHeader>

                <Formik<MediaRegisterValues>
                    initialValues={initialValues}
                    validationSchema={toFormikValidationSchema(mediaRegisterSchema)}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting, isValid, dirty, values, errors, touched, setFieldValue, handleBlur, handleChange }) => (
                        <Form>
                            <FieldGroup>
                                <Field data-invalid={Boolean(touched.url && errors.url)}>
                                    <FieldLabel htmlFor="url">Media URL</FieldLabel>
                                    <Input
                                        id="url"
                                        name="url"
                                        placeholder="https://... or /media/..."
                                        value={values.url}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(touched.url && errors.url)}
                                    />
                                    <FieldDescription>Absolute URL or site-relative path under /media.</FieldDescription>
                                    {touched.url && errors.url ? <FieldError>{errors.url}</FieldError> : null}
                                </Field>

                                <Field data-invalid={Boolean(touched.file_type && errors.file_type)}>
                                    <FieldLabel>File Type</FieldLabel>
                                    <Select value={values.file_type} onValueChange={(val) => void setFieldValue("file_type", val)}>
                                        <SelectTrigger aria-invalid={Boolean(touched.file_type && errors.file_type)}>
                                            <SelectValue placeholder="Select file format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="image/jpeg">JPEG Image</SelectItem>
                                                <SelectItem value="image/png">PNG Image</SelectItem>
                                                <SelectItem value="image/webp">WebP Image</SelectItem>
                                                <SelectItem value="image/gif">GIF Image</SelectItem>
                                                <SelectItem value="application/pdf">PDF Document</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {touched.file_type && errors.file_type ? <FieldError>{errors.file_type}</FieldError> : null}
                                </Field>

                                <Field data-invalid={Boolean(touched.alt_text && errors.alt_text)}>
                                    <FieldLabel htmlFor="alt_text">Alt Text (Optional)</FieldLabel>
                                    <Input
                                        id="alt_text"
                                        name="alt_text"
                                        placeholder="Description for screen readers"
                                        value={values.alt_text ?? ""}
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                        aria-invalid={Boolean(touched.alt_text && errors.alt_text)}
                                    />
                                    {touched.alt_text && errors.alt_text ? <FieldError>{errors.alt_text}</FieldError> : null}
                                </Field>

                                <Field data-invalid={Boolean(touched.cid && errors.cid)}>
                                    <FieldLabel htmlFor="cid">Catalog ID (Optional)</FieldLabel>
                                    <Input
                                        id="cid"
                                        name="cid"
                                        type="number"
                                        min={1}
                                        placeholder="Numeric CID to auto-link"
                                        value={values.cid ?? ""}
                                        onBlur={handleBlur}
                                        onChange={(event) => {
                                            const next = event.target.value;
                                            void setFieldValue("cid", next === "" ? undefined : Number(next));
                                        }}
                                        aria-invalid={Boolean(touched.cid && errors.cid)}
                                    />
                                    <FieldDescription>If provided, the media is linked to that catalog item on create.</FieldDescription>
                                    {touched.cid && errors.cid ? <FieldError>{errors.cid}</FieldError> : null}
                                </Field>
                            </FieldGroup>

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || registerMedia.isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!isValid || !dirty || isSubmitting || registerMedia.isPending}>
                                    {isSubmitting || registerMedia.isPending ? "Registering..." : "Register Media"}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}
