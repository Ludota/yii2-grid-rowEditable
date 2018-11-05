<?php
/**
 * @link https://github.com/Konstantin-Vl/yii2-grid-rowEditor
 * @copyright Copyright (c) 2018 Konstantin Voloshchuk
 * @license https://github.com/Konstantin-Vl/yii2-grid-rowEditor/blob/master/LICENSE
 */

namespace Kosv\Yii2Grid\RowEditor\Input;

use yii\helpers\Html;

/**
 * @author Konstantin Voloshchuk <kosv.dev@gmail.com>
 * @since 1.0
 */
class Input extends AbstractInput implements InputInterface
{
    /**
     * @var string
     */
    public $name;

    /**
     * @var array
     */
    public $options = [];

    /**
     * @var string
     */
    public $type = 'text';

    /**
     * @var string
     */
    public $value;

    /**
     * @return string
     */
    public function __toString()
    {
        return Html::input(
            $this->type,
            $this->name ?: $this->getName(),
            $this->value,
            $this->options
        )
    }
}