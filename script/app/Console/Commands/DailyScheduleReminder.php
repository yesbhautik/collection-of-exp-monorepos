<?php

namespace App\Console\Commands;

use App\Events\DailyScheduleEvent;
use App\Models\Event;
use App\Models\Holiday;
use App\Models\TaskboardColumn;
use App\Models\User;
use Illuminate\Console\Command;
use Modules\Recruit\Entities\RecruitInterviewEmployees;
use Modules\Recruit\Entities\RecruitInterviewSchedule;

class DailyScheduleReminder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'daily-schedule-reminder';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'send the daily updates to employees about their tasks, leaves, holidays, events and interviews';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $employeeIds = User::withRole('employee')->pluck('id')->toArray();
        $data = [];
        $completedTaskColumn = TaskboardColumn::completeColumn();

        foreach($employeeIds as $employeeId)
        {
            $user = User::with(['employeeDetail', 'tasks' => function($query) use($completedTaskColumn) {
                    $query->whereDate('due_date', '=', now())
                        ->where('board_column_id', '<>', $completedTaskColumn->id);
            }, 'leaves' => function($leaves){
                $leaves->whereDate('leave_date', '=', now())
                    ->where('leaves.status', 'approved');
            },
            ])->where('id', $employeeId)->first();

            $events = Event::with('attendee', 'attendee.user')
                ->where(function ($query) use($user) {
                    $query->whereHas('attendee', function ($query) use($user) {
                        $query->where('user_id', $user->id);
                    });
                    $query->orWhere('added_by', $user->id);
                })
            ->whereDate('start_date_time', '<=', now()->toDateString())->whereDate('end_date_time', '>=', now()->toDateString())->count();

            $holiday = Holiday::where(function ($query) use ($user) {
                $query->where('added_by', $user->id)
                    ->orWhere(function($query) use($user){
                        $query->where(function ($q) use ($user) {
                            $q->orWhere('department_id_json', 'like', '%"' . $user->employeeDetail->department_id . '"%')
                                ->orWhereNull('department_id_json');
                        });
                        $query->where(function ($q) use ($user) {
                            $q->orWhere('designation_id_json', 'like', '%"' . $user->employeeDetail->designation_id . '"%')
                                ->orWhereNull('designation_id_json');
                        });
                        $query->where(function ($q) use ($user) {
                            $q->orWhere('employment_type_json', 'like', '%"' . $user->employeeDetail->employment_type . '"%')
                                ->orWhereNull('employment_type_json');
                        });
                    });
            })->whereDate('date', '=', now())->count();

            $interview = RecruitInterviewEmployees::with(['schedule' => function($q){
                $q->whereDate('schedule_date', '=', now());
            }])->where('user_id', $user->id)->count();

            $data['interview'][$user->id] = $interview;
            $data['user'][$user->id] = $user;
            $data['holidays'][$user->id] = $holiday;
            $data['leaves'][$user->id] = $user->leaves->count();
            $data['tasks'][$user->id] = $user->tasks->count();
            $data['events'][$user->id] = $events;
        }
        event(new DailyScheduleEvent($data['user'], $data));
    }

}
