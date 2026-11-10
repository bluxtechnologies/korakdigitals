<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $orders = Order::with('items')
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('orders', [
            'orders' => $orders,
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $user = $request->user();
        $orders = Order::with('items')->where('user_id', $user->id)->orderBy('id', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="korak_orders_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Order Reference', 'Category', 'Service Item', 'Amount', 'Currency', 'Status', 'Credentials / Output', 'Date']);

            foreach ($orders as $order) {
                foreach ($order->items as $item) {
                    $payloadStr = is_array($item->credentials_payload)
                        ? json_encode($item->credentials_payload)
                        : ($item->credentials_payload ?? 'N/A');

                    fputcsv($file, [
                        $order->public_reference,
                        $order->service_category,
                        $item->item_title,
                        $order->total_amount,
                        $order->currency_code,
                        $order->status,
                        $payloadStr,
                        $order->created_at->toIso8601String(),
                    ]);
                }
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportTxt(Request $request): StreamedResponse
    {
        $user = $request->user();
        $orders = Order::with('items')->where('user_id', $user->id)->orderBy('id', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => 'attachment; filename="korak_credentials_' . date('Y-m-d') . '.txt"',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            fwrite($file, "=========================================================\n");
            fwrite($file, " KORAK DIGITALS — ORDERED CREDENTIALS EXPORT\n");
            fwrite($file, " Export Date: " . date('Y-m-d H:i:s') . "\n");
            fwrite($file, "=========================================================\n\n");

            foreach ($orders as $order) {
                foreach ($order->items as $item) {
                    fwrite($file, "ORDER REF : {$order->public_reference}\n");
                    fwrite($file, "SERVICE   : {$item->item_title} ({$order->service_category})\n");
                    fwrite($file, "STATUS    : {$order->status}\n");
                    fwrite($file, "CREDENTIALS:\n");

                    if (is_array($item->credentials_payload)) {
                        foreach ($item->credentials_payload as $k => $v) {
                            fwrite($file, "  - {$k}: {$v}\n");
                        }
                    } else {
                        fwrite($file, "  " . ($item->credentials_payload ?? 'N/A') . "\n");
                    }
                    fwrite($file, "---------------------------------------------------------\n\n");
                }
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
