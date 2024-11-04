using UnityEngine;
using UnityEngine.UI;
using TMPro;
public class Menu : MonoBehaviour
{
    public GameObject closebutton;
    public GameObject[] apps;
    public ScrollRect scrollrect;
    public GameObject[] allies;
    public GameObject[] enemies;
    public RectTransform[] scrollcontents;
    public RectTransform MenuScreen;
    private Stats display;
    public Account account;
    public GameObject statspage;
    public TextMeshProUGUI[] statstexts;
    public TextMeshProUGUI prismstext;
    public async void Start()
    {
        int? prisms = await account.GetPrisms();
        prismstext.text = prisms?.ToString() ?? "0";
    }
    public void App(int index)
    {
        foreach (GameObject app in apps)
        {
            app.SetActive(false);
        }
        scrollrect.content.gameObject.SetActive(false);
        scrollrect.content = scrollcontents[index];
        scrollcontents[index].gameObject.SetActive(true);
        scrollrect.gameObject.SetActive(true);
        closebutton.SetActive(true);
    }
    public async void Close()
    {
        if (display)
        {
            Destroy(display.gameObject);
            statspage.SetActive(false);
            scrollrect.gameObject.SetActive(true);
        }
        else
        {
            foreach (GameObject app in apps)
            {
                app.SetActive(true);
            }
            scrollrect.gameObject.SetActive(false);
            closebutton.SetActive(false);
            int? prisms = await account.GetPrisms();
            prismstext.text = prisms?.ToString() ?? "0";
        }
    }
    public async void AllyPage(int index)
    {
        scrollrect.gameObject.SetActive(false);
        GameObject displayInstance = Instantiate(allies[index], MenuScreen);
        displayInstance.name = displayInstance.name.Replace("(Clone)", "");
        RectTransform rectTransform = displayInstance.AddComponent<RectTransform>();
        rectTransform.anchoredPosition = new Vector2(-450, 0);
        rectTransform.sizeDelta = new Vector2(800, 800);
        SpriteRenderer spriteRenderer = displayInstance.GetComponent<SpriteRenderer>();
        Image image = displayInstance.AddComponent<Image>();
        image.sprite = spriteRenderer.sprite;
        Destroy(spriteRenderer);
        display = displayInstance.GetComponent<Stats>();
        await display.GetStats(display.gameObject.name);
        statspage.SetActive(true);
        statstexts[0].text = displayInstance.name;
        statstexts[1].text = "Attack: " + display.attack.ToString();
        statstexts[2].text = "Health: " + display.health.ToString();
        statstexts[3].text = "Level: " + display.level.ToString();
        statstexts[4].text = "EXP: " + display.exp.ToString();
    }
}