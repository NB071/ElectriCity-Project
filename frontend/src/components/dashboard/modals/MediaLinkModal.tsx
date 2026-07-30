import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Formik, Form } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { mediaLinkSchema, type MediaLinkValues } from "@/zod/mediaLink";
import { linkAdminMediaVariables, useLinkAdminMedia } from "@/hooks/api/media/use-admin-media";

export function MediaLinkModal() {
    const { modals, closeModal } = useUiStore();
    const config = modals.mediaLink;
    const linkMedia = useLinkAdminMedia();

    const onClose = () => {
        closeModal("mediaLink");
    };

    const handleSubmit = (values: MediaLinkValues, { setSubmitting }: { setSubmitting: (pending: boolean) => void }) => {
        if (!config.data?.mediaId) {
            setSubmitting(false);
            return;
        }

        linkMedia.mutate(linkAdminMediaVariables(values.cid, config.data.mediaId), {
            onSettled: () => {
                setSubmitting(false);
                onClose();
            },
        });
    };

    return (
        <Dialog open={config.isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Link Media to Catalog Item</DialogTitle>
                    <DialogDescription>
                        Attach this asset to a catalog product image gallery.
                        {config.data?.label ? <div className="text-foreground mt-2 font-medium">Asset: {config.data.label}</div> : null}
                    </DialogDescription>
                </DialogHeader>

                <Formik<MediaLinkValues>
                    initialValues={{ cid: undefined as unknown as number }}
                    validationSchema={toFormikValidationSchema(mediaLinkSchema)}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, isValid, dirty, values, errors, touched, setFieldValue, handleBlur }) => (
                        <Form>
                            <FieldGroup>
                                <Field data-invalid={Boolean(touched.cid && errors.cid)}>
                                    <FieldLabel htmlFor="cid">Target Catalog ID (CID)</FieldLabel>
                                    <Input
                                        id="cid"
                                        name="cid"
                                        type="number"
                                        min={1}
                                        placeholder="Enter numerical CID (e.g. 1)"
                                        value={values.cid ?? ""}
                                        onBlur={handleBlur}
                                        onChange={(event) => {
                                            const next = event.target.value;
                                            void setFieldValue("cid", next === "" ? undefined : Number(next));
                                        }}
                                        aria-invalid={Boolean(touched.cid && errors.cid)}
                                    />
                                    <FieldDescription>Must match an existing catalog item ID.</FieldDescription>
                                    {touched.cid && errors.cid ? <FieldError>{errors.cid}</FieldError> : null}
                                </Field>
                            </FieldGroup>

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || linkMedia.isPending}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!isValid || !dirty || isSubmitting || linkMedia.isPending || !config.data?.mediaId}>
                                    {isSubmitting || linkMedia.isPending ? "Linking..." : "Link Asset"}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}
