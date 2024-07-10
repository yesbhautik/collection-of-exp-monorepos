@extends('layouts.app')

@push('datatable-styles')
    <script src="{{ asset('vendor/jquery/frappe-charts.min.iife.js') }}"></script>
    @include('sections.datatable_css')
@endpush

@section('filter-section')

    <x-filters.filter-box>
        <!-- CLIENT START -->
        <div class="select-box d-flex  py-2 px-lg-2 px-md-2 px-0 border-right-grey border-right-grey-sm-0">
            <p class="mb-0 pr-2 f-14 text-dark-grey d-flex align-items-center">@lang('app.employee')</p>
            <div class="select-status">
                <select class="form-control select-picker" name="employee" id="employee_id" data-live-search="true"
                    data-size="8">
                    <option value="all">@lang('app.all')</option>
                    @foreach ($employees as $employee)
                        <x-user-option :user="$employee" />
                    @endforeach
                </select>
            </div>
        </div>
        <!-- CLIENT END -->

        <!-- RESET START -->
        <div class="select-box d-flex py-1 px-lg-2 px-md-2 px-0">
            <x-forms.button-secondary class="btn-xs d-none" id="reset-filters" icon="times-circle">
                @lang('app.clearFilters')
            </x-forms.button-secondary>
        </div>
        <!-- RESET END -->

    </x-filters.filter-box>

@endsection

@section('content')
    <!-- CONTENT WRAPPER START -->
    <div class="content-wrapper">
        <div class="row">
            <div class="col-sm-12">
                @php
                    $startOfYear = company()->leaves_start_from == 'joining_date' ? now()->startOfYear() : now()->startOfYear()->month(company()->year_starts_from);
                    $endOfYear = $startOfYear->copy()->addMonths(11);
                @endphp

                <x-alert type="info">@lang('messages.leaveQuotaReport', [
                    'start' => $startOfYear->format('M Y'),
                    'end' => $endOfYear->format('M Y')
                    ])
                </x-alert>
            </div>
        </div>
        <!-- Add Task Export Buttons Start -->
        <div class="d-grid d-lg-flex d-md-flex action-bar">

            <div id="table-actions" class="flex-grow-1 align-items-center mb-2 mb-lg-0 mb-md-0">
            </div>
            <div class="btn-group mt-2 mt-lg-0 mt-md-0 ml-0 ml-lg-3 ml-md-3" role="group">
                <a href="{{ route('leave-report.index') }}" class="btn btn-secondary f-14 leave-report" data-toggle="tooltip"
                    data-original-title="@lang('app.menu.leaveReport')"><i class="side-icon bi bi-list-ul"></i></a>

                <a href="{{ route('leave-report.leave_quota') }}" class="btn btn-secondary f-14 btn-active show-leaves-quota" data-toggle="tooltip"
                    data-original-title="@lang('app.menu.leavesQuota')"><i class="side-icon bi bi-pie-chart-fill"></i></a>
            </div>
        </div>

        <!-- Add Task Export Buttons End -->
        <!-- Task Box Start -->
        <div class="d-flex flex-column w-tables rounded mt-4 bg-white">

            {!! $dataTable->table(['class' => 'table table-hover border-0 w-100']) !!}

        </div>
        <!-- Task Box End -->
    </div>
    <!-- CONTENT WRAPPER END -->

@endsection

@push('scripts')
    @include('sections.datatable_js')

    <script>
        $('#leave-quota-report-table').on('preXhr.dt', function(e, settings, data) {
            var employeeId = $('#employee_id').val();
            if (!employeeId) {
                employeeId = 0;
            }

            data['employeeId'] = employeeId;
            // data['_token'] = '{{ csrf_token() }}';
        });

        const showTable = () => {
            window.LaravelDataTables["leave-quota-report-table"].draw(false);
        }

        $('#employee_id').on('change keyup', function() {
            if ($('#employee_id').val() != "all") {
                $('#reset-filters').removeClass('d-none');
                showTable();
            } else {
                $('#reset-filters').addClass('d-none');
                showTable();
            }
        });

        $('#reset-filters').click(function() {
            $('#filter-form')[0].reset();

            $('.filter-box .select-picker').selectpicker("refresh");
            $('#reset-filters').addClass('d-none');
            showTable();
        });

        $('#leave-quota-report-table').on('click', '.view-leaves', function(event) {
            var id = $(this).data('user-id');
            var url = "{{ route('leave-report.employee-leave-quota', ':id') }}";
            url = url.replace(':id', id);

            $(MODAL_XL + ' ' + MODAL_HEADING).html('...');
            $.ajaxModal(MODAL_XL, url);
        });

    </script>
@endpush
