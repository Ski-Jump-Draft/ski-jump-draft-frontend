interface ToBeatDistanceProps {
    toBeatDistance: number | null | undefined;
}

export function ToBeatDistance({ toBeatDistance }: ToBeatDistanceProps) {
    if (toBeatDistance == null) return null;

    return (
        <div className="text-sm leading-tight">
            <span className="text-muted-foreground">Do objęcia prowadzenia: </span>
            <span className="text-green-600 dark:text-green-500 font-semibold">
                {toBeatDistance.toFixed(1)}m
            </span>
        </div>
    );
}

