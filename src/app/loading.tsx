import { Container, Skeleton } from "@/components/ui/primitives";

export default function Loading() {
  return (
    <div>
      <div className="surface-dark pt-10 pb-16"><Container className="relative z-[1]"><Skeleton className="h-3 w-40 bg-ivory-50/10" /><Skeleton className="mt-6 h-12 w-2/3 max-w-xl bg-ivory-50/10" /><Skeleton className="mt-4 h-5 w-1/2 max-w-md bg-ivory-50/10" /></Container></div>
      <Container className="py-12 space-y-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-2/3" /><Skeleton className="h-40 w-full" /><Skeleton className="h-5 w-1/2" /></Container>
    </div>
  );
}
