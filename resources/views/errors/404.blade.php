@extends('errors.layout')

@section('title', 'Page Not Found')
@section('code', '404 NOT FOUND')

@section('message', "We couldn't find the page or service desk you're looking for. It might have been moved or doesn't exist.")

@section('actions')
    <a href="/user/dashboard" class="btn">Return to Dashboard</a>
    <a href="/user/support" class="btn btn-outline">Help & Support</a>
@endsection
