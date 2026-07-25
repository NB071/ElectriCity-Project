import { useApiQuery, useApiMutation, usePaginatedQuery, useInfiniteApiQuery } from "@/hooks/use-api";
import { queryClient } from "@/integrations/tanstack-query/query-client";
import { useNavigate } from "@tanstack/react-router";

    // Endpoints: [POST] /api/shop/checkout

export const useCheckout = () => {
    const navigate = useNavigate();
    return useApiMutation({
        onSuccess: (response: any)=>{
            queryClient.setQueryData(["checkout-data"], response.data)
            navigate({ to: "/checkout-success" });
        },
        url: "/api/shop/checkout",
        method: "post",
    })
};

