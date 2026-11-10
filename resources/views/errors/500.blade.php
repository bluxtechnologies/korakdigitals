@extends('errors.layout')

@section('title', 'Server Error')
@section('code', '500 ERROR')

@section('message', 'Our system encountered an unexpected error while processing your request. Our technical team has been notified.')

@section('actions')
    <a href="/user/dashboard" class="btn">Return to Dashboard</a>
    <a href="/user/support" class="btn btn-outline">Contact Support</a>
@endsection
