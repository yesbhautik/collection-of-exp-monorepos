<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class TaskSelectionDropdown extends Component
{

    public $tasks;
    public $fieldRequired;

    /**
     * Create a new component instance.
     *
     * @return void
     */
    public function __construct($tasks, $fieldRequired = true)
    {
        $this->tasks = $tasks;
        $this->fieldRequired = $fieldRequired;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return View|Closure|string
     */
    public function render()
    {
        return view('components.task-selection-dropdown');
    }

}
