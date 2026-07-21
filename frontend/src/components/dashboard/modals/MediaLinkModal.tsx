import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { mediaLinkSchema, type MediaLinkValues } from "@/zod/mediaLink";

export function MediaLinkModal() {
    const { modals, closeModal } = useUiStore();
    const config = modals.mediaLink;

    const onClose = () => {
        closeModal("mediaLink");
    };

    const handleSubmit = (values: MediaLinkValues, { setSubmitting }: any) => {
        if (!config.data?.mediaId) return;
        console.log(`Linking mediaId: ${config.data.mediaId} to CID: ${values.cid}`);
        // TODO: logic
        setSubmitting(false);
        onClose();
    };

    return (
        <Dialog open={config.isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Link Media to Catalog Item</DialogTitle>
                    <DialogDescription>
                        Attach this asset into a specific catalog product's public image array.
                        {config.data?.label && <div className="text-foreground mt-2 font-medium">Asset: {config.data.label}</div>}
                    </DialogDescription>
                </DialogHeader>

                <Formik<MediaLinkValues>
                    initialValues={{ cid: "" as unknown as number }}
                    validationSchema={toFormikValidationSchema(mediaLinkSchema)}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, isValid, dirty }) => (
                        <Form className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="cid">Target Catalog ID (CID)</Label>
                                <Field as={Input} id="cid" name="cid" type="number" placeholder="Enter numerical CID (e.g. 55)" />
                                <ErrorMessage name="cid" component="div" className="text-destructive text-xs" />
                            </div>

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!isValid || !dirty || isSubmitting}>
                                    {isSubmitting ? "Linking..." : "Link Asset"}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}
