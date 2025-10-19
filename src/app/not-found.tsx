'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
                {/* 404 Animation */}
                <div className="mb-8">
                    <div className="text-8xl font-black text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text animate-pulse">
                        404
                    </div>
                    <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Error Message */}
                <h1 className="text-3xl font-bold mb-4 text-slate-200">
                    Strona nie została znaleziona
                </h1>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    Wygląda na to, że strona, której szukasz, nie istnieje lub została przeniesiona.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105">
                            <Home className="w-4 h-4 mr-2" />
                            Strona główna
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-6 py-3 rounded-xl transition-all duration-200"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Wróć
                    </Button>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-slate-500 text-sm">
                        © 2025 SJ Draft. Wszystkie prawa zastrzeżone.
                    </p>
                </div>
            </div>
        </div>
    );
}
