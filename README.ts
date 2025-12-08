using System;
using System.Drawing;
using SixLabors.ImageSharp.PixelFormats;

namespace AppiumMobileFramework.ImageComparison.Models
{
    public class ImageComparisonResult
    {
        public bool AreEqual { get; set; }
        public double SimilarityPercentage { get; set; }
        public int DifferentPixels { get; set; }
        public int TotalPixels { get; set; }
        public string DifferenceImagePath { get; set; }
        public List<DifferenceRegion> DifferenceRegions { get; set; } = new List<DifferenceRegion>();
        public TimeSpan ComparisonTime { get; set; }
        public string Image1Path { get; set; }
        public string Image2Path { get; set; }
        public ImageComparisonSettings Settings { get; set; }

        public double DifferencePercentage => 100.0 - SimilarityPercentage;
        public bool HasSignificantDifferences => DifferentPixels > 0;
    }

    public class DifferenceRegion
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public int PixelCount { get; set; }

        public override string ToString()
        {
            return $"Region at ({X}, {Y}) - Size: {Width}×{Height}px - Pixels: {PixelCount}";
        }
    }

    public class ImageComparisonSettings
    {
        public int Threshold { get; set; } = 0;
        public Rgba32 HighlightColor { get; set; } = new Rgba32(255, 255, 0, 255); // Red
        //Rgba32(255, 255, 0, 255); // Yellow
        // OR  
        //Rgba32(255, 0, 255, 255); // Magenta
        // OR
        //Rgba32(0, 255, 255, 255); // Cyan
        public bool GenerateReport { get; set; } = true;
        public bool IncludeRegionAnalysis { get; set; } = true;
        public string OutputDirectory { get; set; }
        public bool UseGrayscaleBackground { get; set; } = true;
    }
}

