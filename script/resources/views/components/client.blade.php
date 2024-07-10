@php
$active = false;

if (!is_null($user) && $user->session) {
    $lastSeen = \Carbon\Carbon::createFromTimestamp($user->session->last_activity)->timezone(company()?company()->timezone:$user->company->timezone);

    $lastSeenDifference = now()->diffInSeconds($lastSeen);
    if ($lastSeenDifference > 0 && $lastSeenDifference <= 90) {
        $active = true;
    }
}
@endphp

<div class="media align-items-center mw-250 @if($user->status != 'active') inactive @endif">
    @if (!is_null($user))
        <a href="{{ route('clients.show', [$user->id]) }}" class="position-relative">
            @if ($active)
                <span class="text-light-green position-absolute f-8 user-online"
                    title="@lang('modules.client.online')"><i class="fa fa-circle"></i></span>
            @endif
            <img src="{{ $user->image_url }}" class="mr-2 taskEmployeeImg rounded-circle"
                alt="{{ $user->name }}" title="{{ $user->name }}">
        </a>
        <div class="media-body text-truncate ">
            <h5 class="mb-0 f-12"><a href="{{ route('clients.show', [$user->id]) }}"
                    class="text-darkest-grey">{{ $user->name_salutation }} @if($user->status != 'active')
                        <i data-toggle="tooltip" data-original-title="@lang('app.inactive')" class='fa fa-circle mr-1 text-red f-10'></i> @endif</a>
                @if (isset($user->admin_approval) && $user->admin_approval == 0)
                    <i class="bi bi-person-x text-red" data-toggle="tooltip"
                        data-original-title="@lang('modules.dashboard.verificationPending')"></i>
                @elseif (user() && user()->id == $user->id)
                    <span class="badge badge-secondary">@lang('app.itsYou')</span>
                @endif
            </h5>
            <p class="mb-0 f-12 text-dark-grey text-truncate">
                {{ !is_null($user->clientDetails) && !is_null($user->clientDetails->company_name) ? $user->clientDetails->company_name : ' ' }}
            </p>
        </div>
    @else
        --
    @endif
</div>
