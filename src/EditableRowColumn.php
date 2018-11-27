<?php
/**
 * @link https://github.com/Konstantin-Vl/yii2-grid-rowEditable
 * @copyright Copyright (c) 2018 Konstantin Voloshchuk
 * @license https://github.com/Konstantin-Vl/yii2-grid-rowEditable/blob/master/LICENSE
 */

namespace Kosv\Yii2Grid\RowEditable;

use Kosv\Yii2Grid\RowEditable\Config\EditConfig;
use Kosv\Yii2Grid\RowEditable\Config\EditConfigInterface;
use Kosv\Yii2Grid\RowEditable\Input\InputDto;
use yii\grid\DataColumn;
use yii\helpers\Html;

/**
 * @author Konstantin Voloshchuk <kosv.dev@gmail.com>
 * @since 1.0
 */
class EditableRowColumn extends DataColumn
{
    /**
     * @var array
     */
    public $editParams = [];

    /**
     * @var EditConfig
     */
    protected $editConfig;

    /**
     * {@inheritdoc}
     */
    public function init()
    {
        parent::init();
        $this->editConfig = $this->getCommonEditConfig()->merge($this->editParams);
    }

    /**
     * @return EditConfigInterface
     */
    protected function getCommonEditConfig()
    {
        /** @var EditableGridInterface $grid */
        $grid = $this->grid;
        if (!$grid instanceof EditableGridInterface) {
            throw new \UnexpectedValueException(get_class($grid) . ' class ' .
                ' must implement the ' . EditableGridInterface::class  . ' interface'
            );
        }

        if ($this->editParams) {
            return clone $grid->getRowEditConfig();
        }

        return $grid->getRowEditConfig();
    }

    /**
     * {@inheritdoc}
     */
    protected function renderDataCellContent($model, $key, $index)
    {
        $displayValue = '';
        $editInput = '';

        if ($this->editConfig->enable) {
            $displayValue = Html::tag(
                $this->editConfig->outputWrapHtmlTag,
                parent::renderDataCellContent($model, $key, $index),
                ['class' => $this->editConfig->outputWrapHtmlClass]
            );


            $editInput = Html::tag(
                $this->editConfig->inputWrapHtmlTag,
                $this->renderDataCellEditInput($model, $key, $index),
                ['class' => $this->editConfig->inputWrapHtmlClass]
            );
        } else {
            $displayValue = parent::renderDataCellContent($model, $key, $index);
        }


        return $displayValue . $editInput;
    }

    /**
     * @param \yii\base\Model $model
     * @param int|string $key
     * @param int $index
     * @return string
     */
    protected function renderDataCellEditInput($model, $key, $index)
    {
        $html = '';
        $inputParams = $this->editConfig->input;

        $inputDto = new InputDto([
            'attribute' => $this->attribute,
            'form' => $this->editConfig->form,
            'formAttribute' => $this->editConfig->formAttribute,
            'index' => $index,
            'key' => $key,
            'model' => $model,
        ]);

        if (is_string($inputParams)) {
            $inputType = $inputParams;

            $html = strval(new $inputType($inputDto));
        } elseif (is_array($inputParams)) {
            $inputType = EditConfigInterface::INPUT_TYPE_INPUT;
            if (isset($inputParams['type'])) {
                $inputType = $inputParams['type'];
                unset($inputParams['type']);
            }

            $html = strval(new $inputType($inputDto, $inputParams));
        } elseif ($inputParams instanceof \Closure) {
            $callback = $inputParams;

            $html = call_user_func($callback, $inputDto);
        }

        return $html;
    }
}