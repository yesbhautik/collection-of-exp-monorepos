<?php

namespace App\DataTables;

use App\DataTables\BaseDataTable;
use App\Models\User;
use Carbon\Carbon;
use Yajra\DataTables\Html\Button;
use Yajra\DataTables\Html\Column;

class LeaveQuotaReportDataTable extends BaseDataTable
{

    /**
     * Build DataTable class.
     *
     * @param mixed $query Results from query() method.
     * @return \Yajra\DataTables\DataTableAbstract
     */

    private $viewLeaveReportPermission;

    public function __construct()
    {
        parent::__construct();
        $this->viewLeaveReportPermission = user()->permission('view_leave_report');
    }

    public function dataTable($query)
    {

        return datatables()
            ->eloquent($query)
            ->addColumn('action', function ($row) {
                $action = '<div class="task_view">
                    <a href="javascript:;" data-user-id="' . $row->id . '" class="taskView view-leaves border-right-0">' . __('app.view') . '</a>
                </div>';

                return $action;
            })
            ->addColumn('employee_name', function ($row) {
                return $row->name;
            })
            ->addColumn('name', function ($row) {
                return view('components.employee', [
                    'user' => $row
                ]);
            })
            ->addColumn('totalLeave', function ($row) {
                return $this->getAllowedLeavesQuota($row)->sum('no_of_leaves') ?: '0';
            })
            ->addColumn('usedLeave', function ($row) {
                return $this->getAllowedLeavesQuota($row)->sum('leaves_used') ?: '0';
            })
            ->addColumn('remainingLeave', function ($row) {
                return $this->getAllowedLeavesQuota($row)->sum('leaves_remaining') ?: '0';
            })
            ->addIndexColumn()
            ->rawColumns(['action', 'name']);
    }

    /**
     * @param User $model
     * @return \Illuminate\Database\Query\Builder
     */
    public function query(User $model)
    {
        $request = $this->request();

        $employeeId = $request->employeeId;

        $model = $model->onlyEmployee()->with('employeeDetail', 'leaveTypes');

        if ($employeeId != 0 && $employeeId != 'all') {
            $model->where('id', $employeeId);
        }

        if(in_array('employee', user_roles()) && $this->viewLeaveReportPermission == 'owned')
        {
            $model->whereHas('employeeDetail', function($query){
                $query->where('id', user()->id);
            });

        }

        if(in_array('employee', user_roles()) && $this->viewLeaveReportPermission == 'both')
        {
            $model->whereHas('employeeDetail', function($query){
                $query->where('added_by', user()->id)->orWhere('id', user()->id);
            });
        }

        if(in_array('employee', user_roles()) && $this->viewLeaveReportPermission == 'added')
        {
            $model->whereHas('employeeDetail', function($query){
                $query->where('added_by', user()->id);
            });
        }

        return $model;
    }

    /**
     * Optional method if you want to use html builder.
     *
     * @return \Yajra\DataTables\Html\Builder
     */
    public function html()
    {
        $dataTable = $this->setBuilder('leave-quota-report-table')
            ->parameters([
                'initComplete' => 'function () {
                    window.LaravelDataTables["leave-quota-report-table"].buttons().container()
                     .appendTo( "#table-actions")
                 }'
            ]);

        if (canDataTableExport()) {
            $dataTable->buttons(Button::make(['extend' => 'excel', 'text' => '<i class="fa fa-file-export"></i> ' . trans('app.exportExcel')]));
        }

        return $dataTable;
    }

    /**
     * Get columns.
     *
     * @return array
     */
    protected function getColumns()
    {
        return [
            __('app.id') => ['data' => 'id', 'name' => 'id', 'visible' => false, 'exportable' => false, 'title' => __('app.id')],
            '#' => ['data' => 'DT_RowIndex', 'orderable' => false, 'searchable' => false, 'visible' => false, 'title' => '#'],
            __('app.employee') => ['data' => 'name', 'name' => 'users.name', 'exportable' => false, 'title' => __('app.employee')],
            __('app.name') => ['data' => 'employee_name', 'name' => 'users.name', 'visible' => false, 'title' => __('app.name')],
            __('modules.leaves.noOfLeaves') => ['data' => 'totalLeave', 'name' => 'totalLeave', 'class' => 'text-center', 'title' => __('app.totalLeave')],
            __('modules.leaves.leavesTaken') => ['data' => 'usedLeave', 'name' => 'usedLeave', 'class' => 'text-center', 'title' => __('modules.leaves.leavesTaken')],
            __('modules.leaves.remainingLeaves') => ['data' => 'remainingLeave', 'name' => 'remainingLeave', 'class' => 'text-center', 'title' => __('modules.leaves.remainingLeaves')],
            Column::computed('action', __('app.action'))
                ->exportable(false)
                ->printable(false)
                ->orderable(false)
                ->searchable(false)
                ->width(150)
                ->addClass('text-right pr-20')
        ];
    }

    protected function getAllowedLeavesQuota($row)
    {
        $leaveQuotas = $row->leaveTypes;
        $allowedLeavesQuota = collect([]);


        foreach ($leaveQuotas as $leaveQuota) {
            if (($leaveQuota->leaveType->leaveTypeCondition($leaveQuota->leaveType, $row)))
            {
                $allowedLeavesQuota->push($leaveQuota);
            }
        }

        return $allowedLeavesQuota;
    }

}
