<?php

namespace App\Notifications;

use App\Models\EmailNotificationSetting;
use App\Models\Task;
use Illuminate\Notifications\Messages\SlackMessage;
use Illuminate\Notifications\Messages\MailMessage;
use NotificationChannels\OneSignal\OneSignalChannel;
use NotificationChannels\OneSignal\OneSignalMessage;

class NewTask extends BaseNotification
{


    /**
     * Create a new notification instance.
     *
     * @return void
     */
    private $task;
    private $emailSetting;

    public function __construct(Task $task)
    {
        $this->task = $task;
        $this->emailSetting = EmailNotificationSetting::userAssignTask();
        $this->company = $this->task->company;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        $via = ['database'];

        if ($this->emailSetting->send_email == 'yes' && $notifiable->email_notifications && $notifiable->email != '') {
            array_push($via, 'mail');
        }

        if ($this->emailSetting->send_slack == 'yes' && $this->company->slackSetting->status == 'active') {
            $this->slackUserNameCheck($notifiable) ? array_push($via, 'slack') : null;
        }

        if ($this->emailSetting->send_push == 'yes') {
            array_push($via, OneSignalChannel::class);
        }

        return $via;
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param mixed $notifiable
     * @return MailMessage
     */
    public function toMail($notifiable): MailMessage
    {
        $build = parent::build();
        $url = route('tasks.show', $this->task->id);
        $url = getDomainSpecificUrl($url, $this->company);

        $dueDate = (!is_null($this->task->due_date)) ? $this->task->due_date->format($this->company->date_format) : null;
        $taskShortCode = (!is_null($this->task->task_short_code)) ? '#' . $this->task->task_short_code . ' - ' : ' ';


        $content = $this->task->heading . ' ' . $taskShortCode . '<p>
            <b style="color: green">' . __('app.dueDate') . ': ' . $dueDate . '</b>
        </p>';

        $subject = __('email.newTask.subject') . ' ' . $taskShortCode . config('app.name'). '.';

        return $build
            ->subject($subject)
            ->greeting(__('email.hello') . ' ' . $notifiable->name . ',')
            ->markdown('mail.task.created', [
                'url' => $url,
                'content' => $content,
                'themeColor' => $this->company->header_color,
                'notifiableName' => $notifiable->name
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array
     */
    public function toArray()
    {
        return [
            'id' => $this->task->id,
            'created_at' => $this->task->created_at->format('Y-m-d H:i:s'),
            'heading' => $this->task->heading
        ];
    }

    /**
     * Get the Slack representation of the notification.
     *
     * @param mixed $notifiable
     * @return SlackMessage
     */
    public function toSlack($notifiable)
    {
        $dueDate = (!is_null($this->task->due_date)) ? $this->task->due_date->format($this->company->date_format) : null;
        $url = route('tasks.show', $this->task->id);
        $url = getDomainSpecificUrl($url, $this->company);

        return $this->slackBuild($notifiable)
            ->content('*' . __('email.newTask.subject') . '*' . "\n" . '<' . $url . '|' . $this->task->heading . '>' . "\n" . ' #' . $this->task->task_short_code . "\n" . __('app.dueDate') . ': ' . $dueDate . (!is_null($this->task->project) ? "\n" . __('app.project') . ' - ' . $this->task->project->project_name : ''));

    }

    // phpcs:ignore
    public function toOneSignal($notifiable)
    {
        return OneSignalMessage::create()
            ->setSubject(__('email.newTask.subject'))
            ->setBody($this->task->heading);
    }

}
