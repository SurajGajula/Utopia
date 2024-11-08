using UnityEngine;
using UnityEngine.UI;
using System;
public class Healthbar : MonoBehaviour
{
    public int maxHealth;
    public Image healthFill;
    public Battle battle;
    public int statusindex = 0;
    public Image[] Statuses;
    public void SetFill(float amount)
    {
        healthFill.fillAmount = amount / maxHealth;
    }
    public void SetStatus(string status, bool add = true)
    {
        if (add)
        {
            if (statusindex < 3)
            {
                Statuses[statusindex].gameObject.SetActive(true);
                Statuses[statusindex].sprite = battle.StatusIcons[Array.IndexOf(battle.StatusNames, status)];
                statusindex++;
            }
        }
        else
        {
            int removeIndex = Array.FindIndex(Statuses, s => s.sprite == battle.StatusIcons[Array.IndexOf(battle.StatusNames, status)]);
            if (removeIndex != -1)
            {
                for (int i = removeIndex; i < statusindex - 1; i++)
                {
                    Statuses[i].sprite = Statuses[i + 1].sprite;
                }
                Statuses[statusindex - 1].gameObject.SetActive(false);
                statusindex--;
            }
        }
    }
    public void ResetStatuses()
    {
        foreach (Image status in Statuses)
        {
            status.gameObject.SetActive(false);
        }
        statusindex = 0;
    }
}