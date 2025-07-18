import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { ZoomControlProps } from '@/types';
import { cn } from '@/lib/utils';

/**
 * 缩放控制组件
 * 提供放大、缩小和重置缩放功能
 */
export const ZoomControl: React.FC<ZoomControlProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  minScale,
  maxScale
}) => {
  // 计算缩放百分比
  const zoomPercentage = Math.round(scale * 100);
  
  // 检查是否达到缩放限制
  const isMinZoom = scale <= minScale;
  const isMaxZoom = scale >= maxScale;
  
  return (
    <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm border rounded-md shadow-sm">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onZoomOut}
              disabled={isMinZoom}
              className={cn(
                "rounded-r-none",
                isMinZoom && "opacity-50 cursor-not-allowed"
              )}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>缩小</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetZoom}
              className="px-2 h-9 rounded-none border-x"
            >
              <span className="text-xs font-medium">{zoomPercentage}%</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>重置缩放</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onZoomIn}
              disabled={isMaxZoom}
              className={cn(
                "rounded-l-none",
                isMaxZoom && "opacity-50 cursor-not-allowed"
              )}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>放大</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

/**
 * 浮动缩放控制组件
 * 在图表右下角显示的浮动缩放控制器
 */
export const FloatingZoomControl: React.FC<ZoomControlProps> = (props) => {
  return (
    <div className="absolute bottom-4 right-4 z-10">
      <ZoomControl {...props} />
    </div>
  );
};