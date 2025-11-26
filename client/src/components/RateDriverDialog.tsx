import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { createReview, completeTrip } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface RateDriverDialogProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    driverId: string;
    driverName: string;
    onSuccess: () => void;
}

export default function RateDriverDialog({
    isOpen,
    onClose,
    tripId,
    driverId,
    driverName,
    onSuccess,
}: RateDriverDialogProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({
                title: "Rating Required",
                description: "Please select a star rating",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // 1. Submit Review
            await createReview({
                trip_id: tripId,
                reviewee_id: driverId,
                rating,
                comment,
            });

            // 2. Complete Trip
            await completeTrip(tripId);

            toast({
                title: "Trip Completed",
                description: "Thank you for your feedback!",
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Rating error:", error);
            toast({
                title: "Error",
                description: "Failed to submit rating. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rate Your Trip</DialogTitle>
                    <DialogDescription>
                        How was your experience with {driverName}?
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center py-6 gap-4">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`h-8 w-8 ${star <= rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-slate-300"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                        {rating === 5 ? "Excellent!" :
                            rating === 4 ? "Good" :
                                rating === 3 ? "Okay" :
                                    rating === 2 ? "Poor" :
                                        rating === 1 ? "Terrible" : "Select a rating"}
                    </p>
                </div>

                <div className="space-y-2">
                    <Textarea
                        placeholder="Share details about your trip (optional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="resize-none"
                    />
                </div>

                <DialogFooter className="sm:justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Skip & Complete
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Review"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
