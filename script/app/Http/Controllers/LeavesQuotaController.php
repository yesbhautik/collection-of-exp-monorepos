<?php

namespace App\Http\Controllers;

use App\Helper\Reply;
use App\Models\EmployeeLeaveQuota;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class LeavesQuotaController extends AccountBaseController
{

    public function __construct()
    {
        parent::__construct();
        $this->pageTitle = 'app.menu.leaves';
        $this->middleware(function ($request, $next) {
            abort_403(!in_array('leaves', $this->user->modules));
            return $next($request);
        });
    }

    public function update(Request $request, $id)
    {
        $type = EmployeeLeaveQuota::findOrFail($id);

        if ($request->leaves < 0 || $request->leaves < $type->leaves_used) {
            return Reply::error('messages.employeeLeaveQuota');
        }

        $type->no_of_leaves = $request->leaves;
        $type->leaves_remaining = $request->leaves - $type->leaves_used;
        $type->save();

        session()->forget('user');

        return Reply::success(__('messages.leaveTypeAdded'));
    }

    public function employeeLeaveTypes($userId)
    {
        if ($userId != 0) {
            $employee = User::with(['roles', 'leaveTypes'])->findOrFail($userId);
            $options = '';

            foreach($employee->leaveTypes->where('leaves_remaining', '>', 0) as $leavesQuota) {
                $hasLeave = $leavesQuota->leaveType->leaveTypeCondition($leavesQuota->leaveType, $employee);

                if ($hasLeave) {
                    $options .= '<option value="' . $leavesQuota->leave_type_id . '"> ' .  $leavesQuota->leaveType->type_name .' (' . $leavesQuota->leaves_remaining . ') </option>'; /** @phpstan-ignore-line */
                }
            }
        }
        else {
            $leaveQuotas = LeaveType::all();

            $options = '';

            foreach ($leaveQuotas as $leaveQuota) {
                $options .= '<option value="' . $leaveQuota->id . '"> ' .  $leaveQuota->type_name . ' (' . $leaveQuota->no_of_leaves . ') </option>'; /** @phpstan-ignore-line */
            }
        }

        return Reply::dataOnly(['status' => 'success', 'data' => $options]);
    }

}
