'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export interface PrivateRoomDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (nick: string, password: string) => Promise<void>;
    busy?: boolean;
    error?: string | null;
    placeholder?: string;
}

export function PrivateRoomDialog({
    open,
    onClose,
    onSubmit,
    busy = false,
    error = null,
    placeholder = "Twój pseudonim"
}: PrivateRoomDialogProps) {
    const [nick, setNick] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (busy) return;

        const nickToUse = nick.trim() || placeholder;
        await onSubmit(nickToUse, password);
    };

    const handleClose = () => {
        if (busy) return;
        setNick("");
        setPassword("");
        setShowPassword(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent
                className="sm:max-w-md border border-slate-500"
                showCloseButton={!busy}
                onEscapeKeyDown={(e) => busy && e.preventDefault()}
                onPointerDownOutside={(e) => busy && e.preventDefault()}
                onInteractOutside={(e) => busy && e.preventDefault()}
            >
                <DialogHeader className="pb-4">
                    <DialogTitle className="font-display text-center text-2xl flex items-center justify-center gap-2">
                        <Lock className="w-6 h-6 text-purple-400" />
                        Prywatny pokój
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Nickname input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-foreground">
                                Pseudonim
                            </label>
                            <Input
                                placeholder={placeholder}
                                value={nick}
                                onChange={e => setNick(e.target.value)}
                                disabled={busy}
                                className="h-11 px-4 text-base transition-all duration-200 placeholder-gray"
                                maxLength={24}
                            />
                        </div>

                        {/* Password input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-foreground">
                                Hasło dostępu
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Wpisz hasło pokoju"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={busy}
                                    className="h-11 px-4 pr-10 text-base transition-all duration-200 placeholder-gray"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={busy}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={busy}
                            className="flex-1 cursor-pointer transition active:scale-95"
                        >
                            Anuluj
                        </Button>
                        <Button
                            type="submit"
                            disabled={busy || !password.trim()}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 cursor-pointer active:scale-95"
                        >
                            {busy ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Dołączanie…
                                </div>
                            ) : (
                                "Dołącz"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

