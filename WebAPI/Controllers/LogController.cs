using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class LogController : ControllerBase
{
    private readonly string _logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "logs");

    [HttpGet("files")]
    public IActionResult GetLogFiles(int pageNumber = 1, int pageSize = 10)
    {
        var logFiles = Directory.EnumerateFiles(_logDirectory, "*.txt")
                                .Select(file => new
                                {
                                    FileName = Path.GetFileName(file),
                                    LastModified = System.IO.File.GetLastWriteTime(file)
                                })
                                .OrderByDescending(file => file.LastModified)
                                .ToList();

        var paginatedFiles = logFiles.Skip((pageNumber - 1) * pageSize)
                                     .Take(pageSize)
                                     .ToList();

        return Ok(new
        {
            TotalFiles = logFiles.Count,
            PageNumber = pageNumber,
            PageSize = pageSize,
            records = paginatedFiles
        });
    }

    [HttpGet("content")]
    public IActionResult GetLogContent(string fileName, int pageNumber = 1, int pageSize = 20)
    {
        var filePath = Path.Combine(_logDirectory, fileName);

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound("Log file not found");
        }

        // Create a temporary file copy
        var tempFilePath = Path.Combine(_logDirectory, "temp_" + fileName);
        System.IO.File.Copy(filePath, tempFilePath, overwrite: true);

        try
        {
            var lines = System.IO.File.ReadLines(tempFilePath).ToList();
            var paginatedLines = lines.Skip((pageNumber - 1) * pageSize)
                                      .Take(pageSize)
                                      .ToList();

            return Ok(new
            {
                FileName = fileName,
                TotalLines = lines.Count,
                PageNumber = pageNumber,
                PageSize = pageSize,
                records = paginatedLines
            });
        }
        finally
        {
            // Clean up the temporary file after reading
            if (System.IO.File.Exists(tempFilePath))
            {
                System.IO.File.Delete(tempFilePath);
            }
        }
    }
}