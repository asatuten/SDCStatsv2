using Microsoft.AspNetCore.Mvc;

namespace WebApp.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Player()
    {
        Console.WriteLine("HITTING PLAYER VIEW");
        return View();
    }
}
