'use client';
import { Countdown } from '@/components/ui/Countdown';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PhaseInfo {
    title: string;
    description: string;
}

interface TransitionProps {
    phases: PhaseInfo[];
    currentIndex: number;
    targetUtc: string | null;
}



export function TransitionScreen({ phases, currentIndex, targetUtc, visible }: TransitionProps & { visible: boolean }) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-10 max-w-5xl w-full">
                            {/* lista faz */}
                            <div className="space-y-6">
                                {phases.map((p, i) => (
                                    <div
                                        key={p.title}
                                        className={cn(
                                            'flex space-x-4 items-start',
                                            i === currentIndex ? 'opacity-100' : 'opacity-60',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'flex h-10 w-10 items-center justify-center rounded-full border-2',
                                                i === currentIndex ? 'border-white bg-white text-black' : 'border-neutral-400',
                                            )}
                                        >
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{p.title}</h3>
                                            <p className="text-sm text-neutral-300 max-w-md leading-snug">
                                                {p.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* licznik */}
                            <div className="flex items-center justify-center">
                                <Countdown targetUtc={targetUtc} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}


// export function TransitionScreen({ phases, currentIndex, targetUtc }: TransitionProps) {
//     return (
//         <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-10 max-w-5xl w-full">
//                 {/* lista faz */}
//                 <div className="space-y-6">
//                     {phases.map((p, i) => (
//                         <div
//                             key={p.title}
//                             className={cn(
//                                 'flex space-x-4 items-start',
//                                 i === currentIndex ? 'opacity-100' : 'opacity-60',
//                             )}
//                         >
//                             <div
//                                 className={cn(
//                                     'flex h-10 w-10 items-center justify-center rounded-full border-2',
//                                     i === currentIndex ? 'border-white bg-white text-black' : 'border-neutral-400',
//                                 )}
//                             >
//                                 {i + 1}
//                             </div>
//                             <div>
//                                 <h3 className="font-semibold text-lg">{p.title}</h3>
//                                 <p className="text-sm text-neutral-300 max-w-md leading-snug">
//                                     {p.description}
//                                 </p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* licznik */}
//                 <div className="flex items-center justify-center">
//                     <Countdown targetUtc={targetUtc} />
//                 </div>
//             </div>
//         </div>
//     );
// }