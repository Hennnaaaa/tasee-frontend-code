import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SEND_SUPPORT_MAIL } from "@/utils/routes/support.routes";
import axios from "axios";
const Support = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        subject: "",
        email: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post(SEND_SUPPORT_MAIL, { 
                    subject: formData.subject,
                    userEmail: formData.email,
                    message: formData.message
             },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            if (response.status === 200) {
                alert("Your message has been sent successfully!");
                setIsSubmitting(false);
                setIsOpen(false);
                setFormData({ subject: "", email: "", message: "" });
            }
        } catch (error) {
            console.error("Error sending support mail:", error);
            alert("There was an error sending your message. Please try again later.");
            setIsSubmitting(false);
            return;
        }

    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-pink-600 hover:bg-pink-700 text-white rounded-full p-3 shadow-lg transition-transform hover:scale-110 z-50"
                aria-label="Contact Support"
            >
                <MessageCircle size={24} />
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Contact Support</DialogTitle>
                        <DialogDescription>
                            Fill out this form and our team will get back to you as soon as possible.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                name="subject"
                                placeholder="How can we help you?"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid w-full items-center gap-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="Please describe your issue or question..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="min-h-[120px]"
                            />
                        </div>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="mr-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-pink-600 hover:bg-pink-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send Message"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Support;
