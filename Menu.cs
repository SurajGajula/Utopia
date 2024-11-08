using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System;
using System.Threading.Tasks;
public class Menu : MonoBehaviour
{
    public GameObject closebutton;
    public GameObject[] apps;
    public ScrollRect scrollrect;
    public GameObject[] allies;
    public GameObject[] enemies;
    public RectTransform[] scrollcontents;
    public GameObject MenuScreen;
    public Stats display;
    public Account account;
    public GameObject[] pages;
    public TextMeshProUGUI[] statstexts;
    public TextMeshProUGUI prismstext;
    public AudioSource music;
    public Slider volumebar;
    public TextMeshProUGUI time;
    private float timer = 0f;
    public GameObject pullbg;
    public TextMeshProUGUI pulltext;
    public Sprite[] splasharts;
    public async void Start()
    {
        UpdateTimeDisplay();
        SetVolume(volumebar.value);
        volumebar.onValueChanged.AddListener(SetVolume);
        await account.DailyPrism();
        int prisms = await account.GetPrisms();
        prismstext.text = prisms.ToString();
    }
    void Update()
    {
        timer += Time.deltaTime;

        if (timer >= 1f)
        {
            UpdateTimeDisplay();
            timer = 0f;
        }
    }
    void UpdateTimeDisplay()
    {
        DateTime currentTime = DateTime.Now;
        time.text = currentTime.ToString("HH:mm");
    }
    public void App(int index)
    {
        foreach (GameObject app in apps)
        {
            app.SetActive(false);
        }
        closebutton.SetActive(true);
        if (index < 4)
        {
            scrollrect.content.gameObject.SetActive(false);
            scrollrect.content = scrollcontents[index];
            scrollcontents[index].gameObject.SetActive(true);
            scrollrect.gameObject.SetActive(true);
            if (index == 1)
            {
                foreach (Transform child in scrollcontents[1].transform)
                {
                    bool shouldActivate = System.Array.Exists(allies, ally => ally.name == child.name);
                    child.gameObject.SetActive(shouldActivate);
                }
            }
        }
        pages[1].SetActive(index == 4);
    }
    public async void Close()
    {
        if (pages[0].gameObject.activeSelf)
        {
            display.gameObject.SetActive(false);
            pages[0].SetActive(false);
            scrollrect.gameObject.SetActive(true);
        }
        else
        {
            foreach (GameObject app in apps)
            {
                app.SetActive(true);
            }
            pages[1].SetActive(false);
            scrollrect.gameObject.SetActive(false);
            closebutton.SetActive(false);
            int? prisms = await account.GetPrisms();
            prismstext.text = prisms?.ToString() ?? "0";
        }
    }
    public async void PullWrapper()
    {
        await Pull();
    }
    public async Task Pull()
    {
        bool pulled = await account.UsePrisms();
        if (pulled)
        {
            int prisms = await account.GetPrisms();
            prismstext.text = prisms.ToString();
            scrollrect.gameObject.SetActive(false);
            pullbg.gameObject.SetActive(true);
            Image pullBgImage = pullbg.GetComponent<Image>();
            System.Random random = new System.Random();
            for (int i = 0; i < 10; i++)
            {
                pullBgImage.sprite = splasharts[random.Next(splasharts.Length)];
                pulltext.text = pullBgImage.sprite.name.Replace("splash", " ");
                await account.AddAlly(pulltext.text);
                await Task.Delay(1000);
            }
            pullbg.gameObject.SetActive(false);
            scrollrect.gameObject.SetActive(true);
        }
    }
    public void SetVolume(float volume)
    {
        music.volume = volume;
    }
    public void ReorderAllies(int newIndex)
    {
        int currentIndex = Array.FindIndex(allies, ally => ally.name == display.name);
        GameObject allyToMove = allies[currentIndex];
        if (newIndex > currentIndex)
        {
            for (int i = currentIndex; i < newIndex; i++)
            {
                allies[i] = allies[i + 1];
            }
        }
        else if (newIndex < currentIndex)
        {
            for (int i = currentIndex; i > newIndex; i--)
            {
                allies[i] = allies[i - 1];
            }
        }
        allies[newIndex] = allyToMove;
    }
    public async void AllyPage(int index)
    {
        display.gameObject.SetActive(true);
        scrollrect.gameObject.SetActive(false);
        display.name = allies[index].name.Replace("(Clone)", "");
        SpriteRenderer spriteRenderer = allies[index].GetComponent<SpriteRenderer>();
        Image displayImage = display.GetComponent<Image>();
        displayImage.sprite = spriteRenderer.sprite;
        Stats allystats = allies[index].GetComponent<Stats>();
        display.skillstatuses = allystats.skillstatuses;
        display.skillnames = allystats.skillnames;
        display.skillhits = allystats.skillhits;
        await display.GetStats(display.name);
        statstexts[0].text = display.name;
        statstexts[1].text = $"Attack: {display.attack}";
        statstexts[2].text = $"Health: {display.health}";
        statstexts[3].text = $"Level: {display.level}";
        statstexts[4].text = $"EXP: {display.exp}";
        statstexts[5].text = SkillDescription(0);
        statstexts[6].text = SkillDescription(1);
        statstexts[7].text = SkillDescription(2);
        pages[0].SetActive(true);
    }
    public string SkillDescription(int index)
    {
        string desc = $"{display.skillnames[index]}: Deals {display.attack} damage";
        if (display.skillhits[index] == 1)
        {
            desc += " 1 time";
        }
        else if (display.skillhits[index] > 1)
        {
            desc += $" {display.skillhits[index]} times";
        }
        desc += (display.skillstatuses[index] != "None" ? $" and inflicts {display.skillstatuses[index]}." : ".");
        return desc;
    }
}