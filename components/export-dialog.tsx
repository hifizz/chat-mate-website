import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { ExportOptions } from '@/types';
import { exportAsSVG, exportAsPNG, exportAsJPG } from '@/utils/export';
import { LoadingState } from '@/components/ui/loading-state';
import { useMobile } from '@/hooks/use-mobile';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  svgElement?: SVGElement | null;
  containerElement?: HTMLElement | null;
  filename?: string;
}

/**
 * 导出对话框组件
 */
export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  svgElement,
  containerElement,
  filename = 'mermaid-chart'
}) => {
  const [format, setFormat] = useState<ExportOptions['format']>('svg');
  const [quality, setQuality] = useState<number>(90);
  const [scale, setScale] = useState<number>(2);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const isMobile = useMobile();

  // 处理导出
  const handleExport = async () => {
    if (!svgElement && !containerElement) {
      return;
    }

    setIsExporting(true);
    try {
      switch (format) {
        case 'svg':
          if (svgElement) {
            exportAsSVG(svgElement, filename);
          }
          break;
        case 'png':
          if (containerElement) {
            await exportAsPNG(containerElement, filename, { quality, scale });
          }
          break;
        case 'jpg':
          if (containerElement) {
            await exportAsJPG(containerElement, filename, { quality, scale });
          }
          break;
      }
      onClose();
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isMobile ? "max-w-[90vw] sm:max-w-[425px]" : "sm:max-w-[425px]"}>
        <DialogHeader>
          <DialogTitle>导出图表</DialogTitle>
          <DialogDescription>
            选择导出格式和选项
          </DialogDescription>
        </DialogHeader>

        {isExporting ? (
          <LoadingState message="正在导出图表，请稍候..." />
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="format">导出格式</Label>
              <RadioGroup
                id="format"
                value={format}
                onValueChange={(value) => setFormat(value as ExportOptions['format'])}
                className={isMobile ? "flex flex-col space-y-2" : "flex space-x-4"}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="svg" id="svg" />
                  <Label htmlFor="svg">SVG (矢量)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="png" id="png" />
                  <Label htmlFor="png">PNG (透明背景)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="jpg" id="jpg" />
                  <Label htmlFor="jpg">JPG (白色背景)</Label>
                </div>
              </RadioGroup>
            </div>

            {format !== 'svg' && (
              <>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="quality">质量 ({quality}%)</Label>
                  </div>
                  <Slider
                    id="quality"
                    min={10}
                    max={100}
                    step={5}
                    value={[quality]}
                    onValueChange={(values) => setQuality(values[0])}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="scale">缩放比例 ({scale}x)</Label>
                  </div>
                  <Slider
                    id="scale"
                    min={1}
                    max={4}
                    step={0.5}
                    value={[scale]}
                    onValueChange={(values) => setScale(values[0])}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className={isMobile ? "flex-col space-y-2" : undefined}>
          <Button variant="outline" onClick={onClose} className={isMobile ? "w-full" : undefined}>
            取消
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className={isMobile ? "w-full" : undefined}
          >
            {isExporting ? '导出中...' : '导出'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};